"use client";

import { useIngredients } from "../context/ingredients-context";

export function DashboardPantryHighlights() {
  const { ingredients } = useIngredients();
  const count = ingredients.length;

  return (
    <article className="flex min-h-28 items-center gap-4 rounded-2xl border border-[#eadfce] bg-primary/8 px-5 py-4">
      <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <LeafIcon />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-primary">{count}</p>
        <h3 className="mt-1 text-sm font-bold text-[#2d2a25]">
          You have {count === 1 ? "ingredient" : "ingredients"}
        </h3>
        <p className="mt-1 text-xs text-[#625d52]">
          {count ? "Saved in your pantry" : "Add ingredients to get started"}
        </p>
      </div>
    </article>
  );
}

function LeafIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M20 4c-7.5 0-12 4.5-12 10a6 6 0 0 0 6 6c5.5 0 8-6 6-16Z" />
      <path d="M4 20c3-6 7-9 12-10" />
    </svg>
  );
}
