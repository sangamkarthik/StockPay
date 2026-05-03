import { NextResponse } from "next/server";

const MEAL_DB = "https://www.themealdb.com/api/json/v1/1";

type MealSummary = { idMeal: string; strMeal: string; strMealThumb: string };
type MealDetail = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube?: string;
  [key: string]: unknown;
};

function extractIngredients(meal: MealDetail): string[] {
  const result: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = String(meal[`strIngredient${i}`] ?? "").trim();
    if (ing) result.push(ing);
  }
  return result;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("ingredients") ?? "";
  const ingredients = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);

  if (!ingredients.length) {
    return NextResponse.json({ error: "Provide at least one ingredient." }, { status: 400 });
  }

  try {
    // Fetch meal lists for each ingredient in parallel, pick the most-matched ones
    const lists = await Promise.all(
      ingredients.map((ing) =>
        fetch(`${MEAL_DB}/filter.php?i=${encodeURIComponent(ing)}`)
          .then((r) => r.json())
          .then((d) => (Array.isArray(d.meals) ? (d.meals as MealSummary[]) : []))
          .catch(() => [] as MealSummary[]),
      ),
    );

    // Score meals by how many ingredients matched
    const scoreMap = new Map<string, { meal: MealSummary; score: number }>();
    for (const list of lists) {
      for (const meal of list) {
        const existing = scoreMap.get(meal.idMeal);
        if (existing) {
          existing.score += 1;
        } else {
          scoreMap.set(meal.idMeal, { meal, score: 1 });
        }
      }
    }

    // Top 6 by score
    const top = [...scoreMap.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // Fetch full details for each top meal in parallel
    const detailed = await Promise.all(
      top.map(({ meal, score }) =>
        fetch(`${MEAL_DB}/lookup.php?i=${meal.idMeal}`)
          .then((r) => r.json())
          .then((d) => {
            const detail: MealDetail = d.meals?.[0];
            if (!detail) return null;
            return {
              id: detail.idMeal,
              title: detail.strMeal,
              image: detail.strMealThumb,
              category: detail.strCategory,
              area: detail.strArea,
              youtubeUrl: detail.strYoutube || null,
              instructions: detail.strInstructions?.slice(0, 300) + "…",
              ingredients: extractIngredients(detail),
              matchScore: Math.round((score / ingredients.length) * 100),
              source: "themealdb",
            };
          })
          .catch(() => null),
      ),
    );

    const recipes = detailed.filter(Boolean);
    return NextResponse.json({ recipes, total: recipes.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
