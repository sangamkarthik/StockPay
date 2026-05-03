import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Vision AI not configured." }, { status: 500 });
  }

  let imageBase64: string;
  let mimeType: string;

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "No image provided." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image too large (max 8 MB)." }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    imageBase64 = buffer.toString("base64");
    mimeType = file.type || "image/jpeg";
  } catch {
    return NextResponse.json({ error: "Failed to read image." }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";

    const response = await openai.chat.completions.create({
      model,
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'List every food ingredient you can see in this pantry or fridge photo. Return ONLY valid JSON in this exact shape: {"ingredients": ["Garlic", "Tomatoes", "Olive Oil"]}. Use common grocery names, title case. No commentary.',
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: "auto" },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    // Strip markdown code fences if present
    const json = text.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(json) as { ingredients?: string[] };
    const ingredients: string[] = Array.isArray(parsed.ingredients) ? parsed.ingredients.filter(Boolean) : [];

    return NextResponse.json({ ingredients, model, source: "openai" });
  } catch (err) {
    console.error("[pantry/scan]", err);
    return NextResponse.json({ error: "Vision scan failed." }, { status: 502 });
  }
}
