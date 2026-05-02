"use client";

import { FormEvent, type ReactNode, useMemo, useState } from "react";
import { useIngredients } from "../../context/ingredients-context";
import { MissingIngredientsModal } from "./missing-ingredients-modal";

export type RecipeIngredient = {
  amount: string;
  name: string;
  price: number;
};

type IngredientGroup = {
  group: string;
  items: RecipeIngredient[];
  tone: "green" | "red";
};

type RecipeIngredientsPanelProps = {
  ingredients: RecipeIngredient[];
};

const ingredientAvatars: Record<string, string> = {
  butter: "🧈",
  "black pepper": "🌶️",
  garlic: "🧄",
  "cherry tomatoes": "🍅",
  "heavy cream": "🥛",
  "olive oil": "🫒",
  "parmesan cheese": "🧀",
  salt: "🧂",
  spaghetti: "🍝",
  spinach: "🥬",
};

export function RecipeIngredientsPanel({
  ingredients,
}: RecipeIngredientsPanelProps) {
  const {
    addIngredient,
    hasIngredient,
    ingredients: userIngredients,
    removeIngredient,
  } = useIngredients();
  const [newIngredient, setNewIngredient] = useState("");
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);

  const availableIngredients = useMemo(
    () => ingredients.filter((ingredient) => hasIngredient(ingredient.name)),
    [hasIngredient, ingredients],
  );

  const missingIngredients = useMemo(
    () => ingredients.filter((ingredient) => !hasIngredient(ingredient.name)),
    [hasIngredient, ingredients],
  );

  const ingredientGroups: IngredientGroup[] = [
    {
      group: "In your pantry",
      items: availableIngredients,
      tone: "green",
    },
    {
      group: "Missing",
      items: missingIngredients,
      tone: "red",
    },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newIngredient.trim()) {
      return;
    }

    addIngredient(newIngredient);
    setNewIngredient("");
  }

  const missingCount = missingIngredients.length;
  const visibleMissingIngredients = missingIngredients.slice(0, 3);
  const extraMissingCount = Math.max(
    missingCount - visibleMissingIngredients.length,
    0,
  );

  return (
    <>
      <section className="rounded-3xl border border-[#eadfce] bg-white/85 p-5 shadow-sm shadow-[#8c6b3f]/5">
        <h2 className="text-base font-bold text-[#2d2a25]">
          Missing{" "}
          <span className="text-[#df6040]">
            {missingCount} {missingCount === 1 ? "ingredient" : "ingredients"}
          </span>
        </h2>
        <p className="mt-1 text-xs text-[#625d52]">
          {missingCount
            ? "Add missing ingredients to cook this recipe."
            : "You have everything needed for this recipe."}
        </p>

        <div className="mt-4 flex items-center gap-3">
          {visibleMissingIngredients.length ? (
            visibleMissingIngredients.map((ingredient) => (
              <IngredientAvatar
                key={ingredient.name}
                label={ingredientAvatars[ingredient.name.toLowerCase()] ?? "•"}
              />
            ))
          ) : (
            <span className="inline-flex h-10 items-center rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary">
              Ready to cook
            </span>
          )}
          {extraMissingCount > 0 && (
            <span className="grid size-10 place-items-center rounded-xl bg-[#f7f0e7] text-sm font-bold text-[#625d52]">
              +{extraMissingCount}
            </span>
          )}
        </div>

        <button
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-[#cfc5b8]"
          disabled={!missingCount}
          onClick={() => setIsMissingModalOpen(true)}
          type="button"
        >
          <CartIcon />
          Buy Missing Ingredients
        </button>
      </section>

      <section className="rounded-3xl border border-[#eadfce] bg-white/85 p-5 shadow-sm shadow-[#8c6b3f]/5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-bold text-[#2d2a25]">Ingredients</h2>
          <span className="text-xs font-bold text-primary">
            {availableIngredients.length}/{ingredients.length} on hand
          </span>
        </div>

        <div className="space-y-5">
          {ingredientGroups.map((group) => (
            <IngredientGroup key={group.group} {...group} />
          ))}
        </div>

        <form className="mt-5 flex gap-2" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-pantry-ingredient">
            Add pantry ingredient
          </label>
          <input
            className="min-w-0 flex-1 rounded-xl border border-[#ddd3c5] bg-white/70 px-3 text-sm font-bold text-[#2d2a25] outline-none placeholder:text-[#9a9287] focus:border-primary"
            id="new-pantry-ingredient"
            onChange={(event) => setNewIngredient(event.target.value)}
            placeholder="Add ingredient"
            type="text"
            value={newIngredient}
          />
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/70 px-4 text-sm font-bold text-[#2d2a25] transition hover:bg-white"
            type="submit"
          >
            <PlusIcon />
            Add
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {userIngredients.map((ingredient) => (
            <button
              className="rounded-full bg-[#fff6ee] px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-[#ffe9dc]"
              key={ingredient}
              onClick={() => removeIngredient(ingredient)}
              title={`Remove ${ingredient}`}
              type="button"
            >
              {ingredient} ×
            </button>
          ))}
        </div>
      </section>

      <MissingIngredientsModal
        ingredients={missingIngredients}
        isOpen={isMissingModalOpen}
        onClose={() => setIsMissingModalOpen(false)}
      />
    </>
  );
}

function IngredientAvatar({ label }: { label: string }) {
  return (
    <span className="grid size-10 place-items-center rounded-xl bg-[#fff6ee] text-xl shadow-sm">
      {label}
    </span>
  );
}

function IngredientGroup({
  group,
  items,
  tone,
}: IngredientGroup) {
  const styles = {
    green: "bg-primary text-white",
    red: "bg-[#df6040] text-white",
  }[tone];

  return (
    <div>
      <p
        className={`mb-2 text-xs font-bold ${
          tone === "green" ? "text-primary" : "text-[#df6040]"
        }`}
      >
        {group}
      </p>
      <div className="divide-y divide-[#eadfce]">
        {items.length ? (
          items.map((item) => (
            <div className="flex items-center gap-3 py-3" key={item.name}>
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full text-xs ${styles}`}
              >
                {tone === "green" ? "✓" : "!"}
              </span>
              <span className="min-w-0 flex-1 text-sm font-bold text-[#2d2a25]">
                {item.name}
              </span>
              <span className="text-sm text-[#625d52]">{item.amount}</span>
            </div>
          ))
        ) : (
          <p className="py-3 text-sm text-[#625d52]">
            {tone === "green"
              ? "No recipe ingredients match your pantry yet."
              : "Nothing missing."}
          </p>
        )}
      </div>
    </div>
  );
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

function CartIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M6 6h15l-2 8H8L6 6Z" />
      <path d="M6 6 5 3H2" />
      <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </IconSvg>
  );
}

function PlusIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconSvg>
  );
}
