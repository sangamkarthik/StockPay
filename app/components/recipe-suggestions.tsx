"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useIngredients } from "../context/ingredients-context";

type RecipeSuggestion = {
  id: string;
  title: string;
  image: string;
  category: string;
  area: string;
  matchScore: number;
  ingredients: string[];
  youtubeUrl: string | null;
  instructions: string;
};

export function RecipeSuggestions() {
  const { ingredients } = useIngredients();
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFetchRef = useRef<string>("");

  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);

    if (ingredients.length === 0) {
      setRecipes([]);
      setError("");
      return;
    }

    const key = ingredients.slice(0, 10).join(",");
    if (key === lastFetchRef.current) return;

    fetchTimerRef.current = setTimeout(async () => {
      lastFetchRef.current = key;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/recipes/suggest?ingredients=${encodeURIComponent(key)}`,
        );
        const data = await res.json() as { recipes?: RecipeSuggestion[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Failed to load suggestions");
        setRecipes(data.recipes ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load suggestions");
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [ingredients]);

  if (ingredients.length === 0) {
    return (
      <section className="mt-7 rounded-3xl border border-dashed border-[#eadfce] bg-white/60 p-8 text-center">
        <p className="text-2xl">🧺</p>
        <p className="mt-2 text-sm font-bold text-[#2d2a25]">No ingredients yet</p>
        <p className="mt-1 text-xs text-[#625d52]">
          <Link href="/pantry" className="text-primary underline underline-offset-2">Scan your pantry</Link>{" "}
          to get personalized recipe suggestions.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-7 rounded-3xl border border-[#eadfce] bg-white/80 p-5 shadow-sm shadow-[#8c6b3f]/5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="[font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
            Recipes for your pantry
          </h2>
          <p className="mt-0.5 text-xs text-[#9a9287]">
            Based on {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} in your pantry
          </p>
        </div>
        <Link
          href="/pantry"
          className="hidden items-center gap-2 text-sm font-bold text-primary hover:text-[#df6040] sm:inline-flex"
        >
          Update pantry
          <ArrowRightIcon />
        </Link>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-8 justify-center text-sm text-[#625d52]">
          <span className="size-4 animate-spin rounded-full border-2 border-[#eadfce] border-t-primary" />
          Finding matches…
        </div>
      )}

      {error && !loading && (
        <p className="py-6 text-center text-sm text-[#df6040]">{error}</p>
      )}

      {!loading && !error && recipes.length === 0 && (
        <p className="py-6 text-center text-sm text-[#9a9287]">
          No matches found — try adding more ingredients to your pantry.
        </p>
      )}

      {!loading && recipes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  );
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function RecipeCard({ recipe }: { recipe: RecipeSuggestion }) {
  const href = `/recipes/mealdb/${recipe.id}-${toSlug(recipe.title)}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#eadfce] bg-white transition hover:shadow-md hover:shadow-[#8c6b3f]/10">
      <Link href={href} className="block">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-primary shadow-sm">
            {recipe.matchScore}% match
          </div>
        </div>

        <div className="p-4">
          <p className="line-clamp-1 font-bold text-[#2d2a25] group-hover:text-primary transition">{recipe.title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#9a9287]">
            <span>{recipe.category}</span>
            {recipe.area && (
              <>
                <span>·</span>
                <span>{recipe.area}</span>
              </>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.ingredients.slice(0, 4).map((ing) => (
              <span
                key={ing}
                className="rounded-full bg-[#f5ece0] px-2 py-0.5 text-[10px] font-medium text-[#625d52]"
              >
                {ing}
              </span>
            ))}
            {recipe.ingredients.length > 4 && (
              <span className="rounded-full bg-[#f5ece0] px-2 py-0.5 text-[10px] font-medium text-[#9a9287]">
                +{recipe.ingredients.length - 4} more
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex gap-2 px-4 pb-4">
        <Link
          href={href}
          className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white transition hover:bg-primary/90"
        >
          View Recipe
        </Link>
        {recipe.youtubeUrl && (
          <a
            href={recipe.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-[#eadfce] px-3 text-xs font-bold text-[#625d52] transition hover:bg-[#fff6ee]"
            aria-label="Watch on YouTube"
          >
            ▶
          </a>
        )}
      </div>
    </article>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
