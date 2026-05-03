"use client";

import { useCallback, useState } from "react";

type Props = {
  mealDbId: string;
  title: string;
  slug: string;
  thumb?: string;
  category?: string;
  area?: string;
  initialSaved?: boolean;
};

export function SaveRecipeButton({ mealDbId, title, slug, thumb, category, area, initialSaved = false }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (saved) {
        await fetch("/api/recipes/save", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealDbId }),
        });
        setSaved(false);
      } else {
        await fetch("/api/recipes/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealDbId, title, slug, thumb, category, area }),
        });
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  }, [saved, mealDbId, title, slug, thumb, category, area]);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from saved recipes" : "Save recipe"}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
        saved
          ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
          : "border-[#ddd3c5] bg-white/70 text-[#2d2a25] hover:bg-white"
      } disabled:opacity-60`}
    >
      <BookmarkIcon filled={saved} />
      {loading ? "Saving…" : saved ? "Saved" : "Save Recipe"}
    </button>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" className="size-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
