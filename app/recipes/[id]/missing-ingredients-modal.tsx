"use client";

import { useState } from "react";
import { NorthCheckout } from "../../components/north-checkout";
import type { RecipeIngredient } from "./recipe-ingredients-panel";

const TAX_RATE = 0.085;
const SERVICE_FEE = 2.99;
const DELIVERY_FEE = 4.99;

type MissingIngredientsModalProps = {
  ingredients: RecipeIngredient[];
  isOpen: boolean;
  onClose: () => void;
};

export function MissingIngredientsModal({ ingredients, isOpen, onClose }: MissingIngredientsModalProps) {
  const [address, setAddress] = useState("");

  if (!isOpen) return null;

  const products = ingredients.map((i) => ({
    name: i.name,
    price: i.price ?? 2.99,
    quantity: 1,
  }));

  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount + SERVICE_FEE + DELIVERY_FEE;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 p-4"
      role="dialog"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl shadow-[#2d2a25]/20"
        style={{ maxWidth: 1100, maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#eadfce] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#2d2a25]">Buy Missing Ingredients</h2>
            <p className="mt-0.5 text-sm text-[#625d52]">
              {ingredients.length} item{ingredients.length !== 1 ? "s" : ""} &middot; ${grandTotal.toFixed(2)} total
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

        {/* 3-column body */}
        <div className="grid min-h-0 flex-1 overflow-hidden" style={{ gridTemplateColumns: "260px 280px 1fr" }}>

          {/* Left — ingredient cart */}
          <div className="flex flex-col overflow-y-auto border-r border-[#eadfce] p-5">
            <p className="mb-3 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Your cart</p>
            <ul className="flex-1 divide-y divide-[#f5ece0]">
              {products.map((p) => (
                <li key={p.name} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fff1e5] text-xs">🛒</span>
                    <span className="truncate text-sm font-medium text-[#2d2a25]">{p.name}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-sm font-bold text-[#2d2a25]">${p.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 shrink-0 flex items-center justify-between rounded-2xl bg-[#fff6ee] px-3 py-2.5">
              <span className="text-xs font-bold text-[#2d2a25]">Subtotal</span>
              <span className="text-sm font-bold text-primary">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Middle — order details */}
          <div className="flex flex-col overflow-y-auto border-r border-[#eadfce] p-5">
            <p className="mb-4 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Order details</p>

            {/* Fee breakdown */}
            <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#625d52]">Subtotal</span>
                  <span className="font-medium text-[#2d2a25]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#625d52]">Tax (8.5%)</span>
                  <span className="font-medium text-[#2d2a25]">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#625d52]">Service fee</span>
                  <span className="font-medium text-[#2d2a25]">${SERVICE_FEE.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#625d52]">Delivery</span>
                  <span className="font-medium text-[#2d2a25]">${DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#eadfce] pt-2.5 flex justify-between">
                  <span className="font-bold text-[#2d2a25]">Total</span>
                  <span className="text-base font-bold text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Estimated delivery */}
            <div className="mt-4 rounded-2xl border border-[#eadfce] bg-[#f0faf2] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🚚</span>
                <div>
                  <p className="text-xs font-bold text-primary">Estimated delivery</p>
                  <p className="text-xs text-[#625d52]">Tomorrow, 9 am – 12 pm</p>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="mt-4 flex-1 flex flex-col">
              <label className="mb-2 block text-xs font-bold text-[#2d2a25]">
                Delivery address
              </label>
              <input
                className="w-full rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Street address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="City"
                />
                <input
                  className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="ZIP code"
                />
              </div>
            </div>
          </div>

          {/* Right — North checkout */}
          <div className="flex flex-col p-5">
            <p className="mb-4 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Secure payment</p>
            <div className="flex min-h-0 flex-1 flex-col">
              <NorthCheckout
                products={products}
                total={grandTotal}
                tax={taxAmount}
                serviceFee={SERVICE_FEE}
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
