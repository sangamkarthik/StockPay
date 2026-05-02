import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db/prisma";

export async function GET() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      name: true,
    },
    take: 250,
  });

  return NextResponse.json({
    ingredients: ingredients.map((ingredient: { name: string }) => ingredient.name),
  });
}
