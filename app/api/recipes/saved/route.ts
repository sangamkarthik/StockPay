import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db/prisma";

export async function GET() {
  try {
    const recipes = await prisma.savedRecipe.findMany({
      orderBy: { savedAt: "desc" },
    });
    return NextResponse.json({ recipes });
  } catch {
    return NextResponse.json({ error: "Failed to fetch saved recipes." }, { status: 500 });
  }
}
