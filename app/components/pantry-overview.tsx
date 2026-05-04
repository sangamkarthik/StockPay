"use client";

import type { ReactNode } from "react";
import { useIngredients } from "../context/ingredients-context";

type PantryItem = {
  label: string;
  count: number;
  description: string;
  tone: "green" | "gold" | "red";
};

const toneStyles: Record<
  PantryItem["tone"],
  { bg: string; text: string; icon: ReactNode }
> = {
  green: {
    bg: "bg-primary/10",
    text: "text-primary",
    icon: <LeafIcon />,
  },
  gold: {
    bg: "bg-[#d79a20]/12",
    text: "text-[#d79a20]",
    icon: <BowlIcon />,
  },
  red: {
    bg: "bg-[#df6040]/10",
    text: "text-[#df6040]",
    icon: <BagIcon />,
  },
};

export function PantryOverview() {
  const { ingredients } = useIngredients();
  const count = ingredients.length;
  const item: PantryItem = {
    count,
    description: count === 1 ? "Ingredient saved" : "Ingredients saved",
    label: "On hand",
    tone: "green",
  };
  const tone = toneStyles[item.tone];

  return (
    <aside className="rounded-3xl border border-[#eadfce] bg-white/90 p-5 shadow-xl shadow-[#8c6b3f]/10 backdrop-blur">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl border border-[#eadfce] text-primary">
          <JarIcon />
        </span>
        <h2 className="text-base font-bold text-[#2d2a25]">Pantry Overview</h2>
      </div>

      <div className="divide-y divide-[#eadfce]">
        <div className="flex items-center gap-4 py-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-full ${tone.bg} ${tone.text}`}
          >
            {tone.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-2xl font-bold leading-none ${tone.text}`}>
              {item.count}
            </p>
            <p className="mt-1 text-xs font-medium text-[#625d52]">
              {item.label}
            </p>
          </div>
          <p className="text-right text-xs text-[#625d52]">
            {item.description}
          </p>
        </div>
      </div>

      <a
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#fffaf4] px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white"
        href="/pantry"
      >
        View pantry
        <ArrowRightIcon />
      </a>
    </aside>
  );
}

function JarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M8 4h8l1 3H7l1-3Z" />
      <path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
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

function BowlIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 11h16l-1.4 5.2A4 4 0 0 1 14.7 19H9.3a4 4 0 0 1-3.9-2.8L4 11Z" />
      <path d="M7 11 5.5 7.5" />
      <path d="M17 11l1.5-3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
