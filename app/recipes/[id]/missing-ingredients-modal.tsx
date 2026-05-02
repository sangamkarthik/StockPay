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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 px-4"
      role="dialog"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl shadow-[#2d2a25]/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eadfce] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#2d2a25]">Buy Missing Ingredients</h2>
            <p className="mt-0.5 text-sm text-[#625d52]">
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

        {/* Two-column body */}
        <div className="grid md:grid-cols-2">
          {/* Left — ingredient list */}
          <div className="border-b border-[#eadfce] p-6 md:border-b-0 md:border-r">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Your cart</h3>
            <ul className="space-y-1">
              {products.map((p) => (
                <li key={p.name} className="flex items-center justify-between py-2.5 border-b border-[#f5ece0] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#fff1e5] text-xs font-bold text-[#df6040]">!</span>
                    <span className="text-sm font-bold text-[#2d2a25]">{p.name}</span>
                  </div>
                  <span className="text-sm font-bold text-[#2d2a25]">${p.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#fff6ee] px-4 py-3">
              <span className="text-sm font-bold text-[#2d2a25]">Total</span>
              <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Right — North checkout */}
          <div className="p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Secure payment</h3>
            <NorthCheckout
              products={products}
              onApproved={onClose}
              onError={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
