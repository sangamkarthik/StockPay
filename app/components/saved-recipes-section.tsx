"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type SavedRecipe = {
  id: number;
  mealDbId: string;
  title: string;
  slug: string;
  thumb: string | null;
  category: string | null;
  area: string | null;
  savedAt: string;
};

export function SavedRecipesSection() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/recipes/saved")
      .then((r) => r.json())
      .then((d) => { setRecipes(d.recipes ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded || recipes.length === 0) return null;

  return (
    <section className="mt-7 rounded-3xl border border-[#eadfce] bg-white/80 p-5 shadow-sm shadow-[#8c6b3f]/5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="[font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
          Saved Recipes
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {recipes.length} saved
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/mealdb/${recipe.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[#eadfce] bg-[#faf8f5] transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f5ece0]">
              {recipe.thumb ? (
                <Image
                  src={recipe.thumb}
                  alt={recipe.title}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="line-clamp-2 text-sm font-bold text-[#2d2a25] group-hover:text-primary">
                {recipe.title}
              </p>
              {(recipe.category || recipe.area) && (
                <p className="text-xs text-[#9a9287]">
                  {[recipe.area, recipe.category].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
