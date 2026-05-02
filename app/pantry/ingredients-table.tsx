"use client";

import { useMemo, useState, type ReactNode } from "react";

type IngredientCategory =
  | "Vegetables"
  | "Dairy"
  | "Grains"
  | "Oils & Fats"
  | "Herbs"
  | "Protein"
  | "Fruit"
  | "Pantry";

type IngredientsTableProps = {
  ingredients: string[];
  onRemoveIngredient: (ingredient: string) => void;
};

const categoryStyles: Record<IngredientCategory, string> = {
  Dairy: "bg-[#e8f3fb] text-[#46708a]",
  Fruit: "bg-[#ffece1] text-[#b65b31]",
  Grains: "bg-[#fff4d7] text-[#a77412]",
  Herbs: "bg-primary/10 text-primary",
  "Oils & Fats": "bg-[#f0e8fb] text-[#775aa2]",
  Pantry: "bg-[#f7f0e7] text-[#625d52]",
  Protein: "bg-[#ffe7df] text-[#b54e31]",
  Vegetables: "bg-[#eef7e8] text-primary",
};

const categoryKeywords: Array<{
  category: IngredientCategory;
  keywords: string[];
}> = [
  {
    category: "Vegetables",
    keywords: [
      "asparagus",
      "broccoli",
      "carrot",
      "celery",
      "garlic",
      "lettuce",
      "mushroom",
      "onion",
      "pepper",
      "potato",
      "spinach",
      "tomato",
      "zucchini",
    ],
  },
  {
    category: "Dairy",
    keywords: ["butter", "cheese", "cream", "milk", "parmesan", "yogurt"],
  },
  {
    category: "Grains",
    keywords: ["bread", "flour", "noodle", "pasta", "rice", "spaghetti"],
  },
  {
    category: "Oils & Fats",
    keywords: ["avocado oil", "oil", "olive", "sesame oil"],
  },
  {
    category: "Herbs",
    keywords: ["basil", "cilantro", "dill", "mint", "oregano", "parsley"],
  },
  {
    category: "Protein",
    keywords: ["beef", "chicken", "egg", "fish", "salmon", "tofu", "turkey"],
  },
  {
    category: "Fruit",
    keywords: ["apple", "banana", "berry", "lemon", "lime", "orange"],
  },
];

const ingredientEmoji: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ["tomato"], emoji: "🍅" },
  { keywords: ["milk", "cream"], emoji: "🥛" },
  { keywords: ["pasta", "spaghetti", "noodle"], emoji: "🍝" },
  { keywords: ["olive", "oil"], emoji: "🫒" },
  { keywords: ["basil", "herb", "spinach", "lettuce"], emoji: "🌿" },
  { keywords: ["garlic"], emoji: "🧄" },
  { keywords: ["egg"], emoji: "🥚" },
  { keywords: ["cheese", "parmesan"], emoji: "🧀" },
  { keywords: ["rice"], emoji: "🍚" },
  { keywords: ["chicken"], emoji: "🍗" },
  { keywords: ["fish", "salmon"], emoji: "🐟" },
  { keywords: ["lemon", "lime"], emoji: "🍋" },
];

const categories: Array<IngredientCategory | "All Categories"> = [
  "All Categories",
  "Vegetables",
  "Dairy",
  "Grains",
  "Oils & Fats",
  "Herbs",
  "Protein",
  "Fruit",
  "Pantry",
];

export function IngredientsTable({
  ingredients,
  onRemoveIngredient,
}: IngredientsTableProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const pantryIngredients = useMemo(
    () =>
      ingredients.map((ingredient) => ({
        category: getIngredientCategory(ingredient),
        emoji: getIngredientEmoji(ingredient),
        name: ingredient,
      })),
    [ingredients],
  );

  const filteredIngredients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return pantryIngredients.filter((ingredient) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        ingredient.category === selectedCategory;
      const matchesSearch =
        !normalizedQuery ||
        ingredient.name.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [pantryIngredients, searchQuery, selectedCategory]);

  return (
    <section className="mt-6 rounded-3xl border border-[#eadfce] bg-white/85 p-4 shadow-sm shadow-[#8c6b3f]/5 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="[font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
            Your Ingredients
          </h2>
          <span className="rounded-full bg-[#f7f0e7] px-2.5 py-1 text-xs font-bold text-[#625d52]">
            {ingredients.length}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="inline-flex h-12 min-w-56 items-center gap-3 rounded-xl border border-[#eadfce] bg-white px-4 text-[#8f887c]">
            <SearchIcon />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#2d2a25] outline-none placeholder:text-[#a39a8f]"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search ingredients..."
              type="search"
              value={searchQuery}
            />
          </label>

          <label className="inline-flex h-12 items-center gap-3 rounded-xl border border-[#eadfce] bg-white px-4 text-sm font-bold text-[#2d2a25]">
            <GridIcon />
            <select
              className="bg-transparent outline-none"
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value as (typeof categories)[number],
                )
              }
              value={selectedCategory}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfce]">
        <div className="hidden grid-cols-[1.3fr_0.8fr_0.8fr_auto] bg-[#fffaf4] px-5 py-4 text-xs font-bold text-[#625d52] md:grid">
          <span>Ingredient</span>
          <span>Category</span>
          <span>Quantity</span>
          <span className="text-right">Actions</span>
        </div>

        {filteredIngredients.length ? (
          <div className="divide-y divide-[#eadfce]">
            {filteredIngredients.map((ingredient) => (
              <article
                className="grid gap-4 px-5 py-4 md:grid-cols-[1.3fr_0.8fr_0.8fr_auto] md:items-center"
                key={ingredient.name}
              >
                <div className="flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff6ee] text-2xl shadow-sm">
                    {ingredient.emoji}
                  </span>
                  <h3 className="font-bold text-[#2d2a25]">
                    {ingredient.name}
                  </h3>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${categoryStyles[ingredient.category]}`}
                  >
                    {ingredient.category}
                  </span>
                </div>

                <p className="text-sm font-medium text-[#625d52]">On hand</p>

                <button
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#eadfce] px-3 text-sm font-bold text-[#df6040] transition hover:bg-[#fff1e5] md:justify-self-end"
                  onClick={() => onRemoveIngredient(ingredient.name)}
                  type="button"
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center px-5 py-12 text-center">
            <div>
              <p className="text-lg font-bold text-[#2d2a25]">
                No ingredients found
              </p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#625d52]">
                Add an ingredient above or adjust your search and category
                filters.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function getIngredientCategory(ingredient: string): IngredientCategory {
  const normalizedIngredient = ingredient.toLowerCase();
  const match = categoryKeywords.find(({ keywords }) =>
    keywords.some((keyword) => normalizedIngredient.includes(keyword)),
  );

  return match?.category ?? "Pantry";
}

function getIngredientEmoji(ingredient: string) {
  const normalizedIngredient = ingredient.toLowerCase();
  const match = ingredientEmoji.find(({ keywords }) =>
    keywords.some((keyword) => normalizedIngredient.includes(keyword)),
  );

  return match?.emoji ?? "🥫";
}

function IconSvg({
  children,
  className = "size-4",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function GridIcon() {
  return (
    <IconSvg className="size-4 text-[#8f887c]">
      <path d="M4 4h6v6H4z" />
      <path d="M14 4h6v6h-6z" />
      <path d="M4 14h6v6H4z" />
      <path d="M14 14h6v6h-6z" />
    </IconSvg>
  );
}

function SearchIcon() {
  return (
    <IconSvg className="size-5 shrink-0">
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="m21 21-4.3-4.3" />
    </IconSvg>
  );
}
