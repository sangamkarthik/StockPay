"use client";

import { NorthCheckout } from "../../components/north-checkout";
import type { RecipeIngredient } from "./recipe-ingredients-panel";

type MissingIngredientsModalProps = {
  ingredients: RecipeIngredient[];
  isOpen: boolean;
  onClose: () => void;
};

export function MissingIngredientsModal({ ingredients, isOpen, onClose }: MissingIngredientsModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 p-4"
      role="dialog"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl shadow-[#2d2a25]/20" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#eadfce] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#2d2a25]">Buy Missing Ingredients</h2>
            <p className="mt-0.5 text-sm text-[#625d52]">
              {ingredients.length} item{ingredients.length !== 1 ? "s" : ""} &middot; ${total.toFixed(2)} total
            </p>
          </div>
          <button
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#eadfce] text-xl text-[#625d52] transition hover:bg-[#fff6ee]"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Two-column body — fills remaining height */}
        <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_1.1fr]">

          {/* Left — ingredient list, scrolls if tall */}
          <div className="flex flex-col overflow-y-auto border-b border-[#eadfce] p-6 md:border-b-0 md:border-r">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Your cart</p>
            <ul className="flex-1 divide-y divide-[#f5ece0]">
              {products.map((p) => (
                <li key={p.name} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#fff1e5] text-sm">🛒</span>
                    <span className="text-sm font-bold text-[#2d2a25]">{p.name}</span>
                  </div>
                  <span className="ml-4 shrink-0 text-sm font-bold text-[#2d2a25]">${p.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fff6ee] px-4 py-3">
              <span className="text-sm font-bold text-[#2d2a25]">Total</span>
              <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Right — North checkout, fixed height so form has room */}
          <div className="flex flex-col p-6">
            <p className="mb-4 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Secure payment</p>
            <div className="flex min-h-0 flex-1 flex-col">
              <NorthCheckout
                products={products}
                onApproved={onClose}
                onError={() => {}}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
