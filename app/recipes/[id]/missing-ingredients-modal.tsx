"use client";

import { NorthCheckout } from "../../components/north-checkout";
import type { RecipeIngredient } from "./recipe-ingredients-panel";

type MissingIngredientsModalProps = {
  ingredients: RecipeIngredient[];
  isOpen: boolean;
  onClose: () => void;
};

export function MissingIngredientsModal({
  ingredients,
  isOpen,
  onClose,
}: MissingIngredientsModalProps) {
  if (!isOpen) return null;

  const products = ingredients.map((i) => ({
    name: i.name,
    price: i.price ?? 2.99,
    quantity: 1,
  }));

  const total = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-[#2d2a25]/45 px-4"
      role="dialog"
    >
      <div className="w-full max-w-lg rounded-3xl border border-[#eadfce] bg-white p-5 shadow-2xl shadow-[#2d2a25]/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#2d2a25]">
              Buy Missing Ingredients
            </h2>
            <p className="mt-1 text-sm text-[#625d52]">
              {ingredients.length} item{ingredients.length !== 1 ? "s" : ""} &middot; ${total.toFixed(2)} total
            </p>
          </div>
          <button
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#eadfce] text-[#625d52] transition hover:bg-[#fff6ee]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <ul className="mt-4 divide-y divide-[#eadfce]">
          {ingredients.map((ingredient) => (
            <li className="flex items-center justify-between py-3" key={ingredient.name}>
              <div className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-lg bg-[#fff1e5] text-xs font-bold text-[#df6040]">
                  !
                </span>
                <span className="text-sm font-bold text-[#2d2a25]">{ingredient.name}</span>
                <span className="text-xs text-[#625d52]">{ingredient.amount}</span>
              </div>
              <span className="text-sm font-bold text-[#2d2a25]">
                ${(ingredient.price ?? 2.99).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <NorthCheckout
            products={products}
            onApproved={onClose}
            onError={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
