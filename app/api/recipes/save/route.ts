import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db/prisma";

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

    const saved = await prisma.savedRecipe.upsert({
      where: { mealDbId: body.mealDbId },
      update: { title: body.title, slug: body.slug, thumb: body.thumb, category: body.category, area: body.area },
      create: {
        mealDbId: body.mealDbId,
        title: body.title,
        slug: body.slug,
        thumb: body.thumb,
        category: body.category,
        area: body.area,
      },
    });

    return NextResponse.json({ saved: true, id: saved.id });
  } catch {
    return NextResponse.json({ error: "Failed to save recipe." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { mealDbId } = await request.json() as { mealDbId: string };
    if (!mealDbId) return NextResponse.json({ error: "mealDbId required." }, { status: 400 });

    await prisma.savedRecipe.delete({ where: { mealDbId } });
    return NextResponse.json({ saved: false });
  } catch {
    return NextResponse.json({ error: "Failed to unsave recipe." }, { status: 500 });
  }
}
