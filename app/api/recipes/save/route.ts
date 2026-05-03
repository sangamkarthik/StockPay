import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      mealDbId: string;
      title: string;
      slug: string;
      thumb?: string;
      category?: string;
      area?: string;
    };

    if (!body.mealDbId || !body.title || !body.slug) {
      return NextResponse.json({ error: "mealDbId, title and slug are required." }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO saved_recipes (meal_db_id, title, slug, thumb, category, area)
      VALUES (${body.mealDbId}, ${body.title}, ${body.slug}, ${body.thumb ?? null}, ${body.category ?? null}, ${body.area ?? null})
      ON CONFLICT (meal_db_id) DO UPDATE
        SET title = EXCLUDED.title,
            slug  = EXCLUDED.slug,
            thumb = EXCLUDED.thumb,
            category = EXCLUDED.category,
            area = EXCLUDED.area
    `;

    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: "Failed to save recipe." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { mealDbId } = await request.json() as { mealDbId: string };
    if (!mealDbId) return NextResponse.json({ error: "mealDbId required." }, { status: 400 });

    await prisma.$executeRaw`DELETE FROM saved_recipes WHERE meal_db_id = ${mealDbId}`;
    return NextResponse.json({ saved: false });
  } catch {
    return NextResponse.json({ error: "Failed to unsave recipe." }, { status: 500 });
  }
}
