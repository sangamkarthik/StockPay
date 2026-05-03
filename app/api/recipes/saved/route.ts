import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db/prisma";

type SavedRow = {
  id: number;
  meal_db_id: string;
  title: string;
  slug: string;
  thumb: string | null;
  category: string | null;
  area: string | null;
  saved_at: Date;
};

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<SavedRow[]>`
      SELECT id, meal_db_id, title, slug, thumb, category, area, saved_at
      FROM saved_recipes
      ORDER BY saved_at DESC
    `;

    const recipes = rows.map((r) => ({
      id: r.id,
      mealDbId: r.meal_db_id,
      title: r.title,
      slug: r.slug,
      thumb: r.thumb,
      category: r.category,
      area: r.area,
      savedAt: r.saved_at,
    }));

    return NextResponse.json({ recipes });
  } catch {
    return NextResponse.json({ error: "Failed to fetch saved recipes." }, { status: 500 });
  }
}
