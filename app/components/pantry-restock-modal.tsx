"use client";

import { useCallback, useEffect, useState } from "react";
import { NorthCheckout } from "./north-checkout";

const TAX_RATE = 0.085;
const DELIVERY_FEE = 3.99;
// No service fee for restock

const STAPLES = [
  { name: "Olive Oil",        price: 8.99,  emoji: "🫒" },
  { name: "Garlic",           price: 1.49,  emoji: "🧄" },
  { name: "Salt",             price: 1.29,  emoji: "🧂" },
  { name: "Black Pepper",     price: 2.49,  emoji: "🌶️" },
  { name: "Onion",            price: 0.99,  emoji: "🧅" },
  { name: "Butter",           price: 4.99,  emoji: "🧈" },
  { name: "Eggs",             price: 3.99,  emoji: "🥚" },
  { name: "All-Purpose Flour",price: 2.99,  emoji: "🌾" },
  { name: "Sugar",            price: 2.49,  emoji: "🍬" },
  { name: "Rice",             price: 3.49,  emoji: "🍚" },
  { name: "Pasta",            price: 1.99,  emoji: "🍝" },
  { name: "Canned Tomatoes",  price: 1.79,  emoji: "🍅" },
  { name: "Chicken Broth",    price: 2.99,  emoji: "🍲" },
  { name: "Milk",             price: 3.49,  emoji: "🥛" },
  { name: "Lemon",            price: 0.79,  emoji: "🍋" },
  { name: "Soy Sauce",        price: 3.29,  emoji: "🫙" },
];

type RestockItem = (typeof STAPLES)[number] & { qty: number };
type Phase = "select" | "checkout" | "confirmed";
type MobileTab = "items" | "billing" | "payment";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function PantryRestockModal({ isOpen, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [items, setItems] = useState<RestockItem[]>([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("items");

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setPhase("select");
      setItems(STAPLES.map((s) => ({ ...s, qty: 0 })));
      setMobileTab("items");
    }
  }, [isOpen]);

  const toggle = useCallback((name: string) => {
    setItems((prev) =>
      prev.map((i) => (i.name === name ? { ...i, qty: i.qty === 0 ? 1 : 0 } : i)),
    );
  }, []);

  const setQty = useCallback((name: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.name === name ? { ...i, qty } : i)));
  }, []);

  const selected = items.filter((i) => i.qty > 0);
  const subtotal = selected.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax + (selected.length > 0 ? DELIVERY_FEE : 0);

  const products = selected.map((i) => ({
    name: i.name,
    price: i.price,
    quantity: i.qty,
  }));

  const handleApproved = useCallback(() => {
    setPhase("confirmed");
  }, []);

  if (!isOpen) return null;

  if (phase === "confirmed") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 p-4" role="dialog" aria-modal="true">
        <div className="flex w-full max-w-sm flex-col items-center gap-4 overflow-hidden rounded-3xl border border-[#eadfce] bg-white p-8 text-center shadow-2xl">
          <span className="text-5xl">🎉</span>
          <p className="text-xl font-bold text-primary">Restock ordered!</p>
          <p className="text-sm text-[#625d52]">
            {selected.length} item{selected.length !== 1 ? "s" : ""} on the way. Estimated delivery in ~45 min.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {selected.map((i) => (
              <span key={i.name} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {i.emoji} {i.name}
              </span>
            ))}
          </div>
          <button
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const hasItems = selected.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 p-3"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl shadow-[#2d2a25]/20"
        style={{ maxWidth: "min(98vw, 1100px)", maxHeight: "94vh" }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#eadfce] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#2d2a25]">Restock Pantry</h2>
            <p className="mt-0.5 text-sm text-[#625d52]">
              {hasItems
                ? `${selected.length} item${selected.length !== 1 ? "s" : ""} · $${grandTotal.toFixed(2)} total · No service fee`
                : "Select staples to restock"}
            </p>
          </div>
          <button
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#eadfce] text-xl text-[#625d52] hover:bg-[#fff6ee]"
            onClick={onClose}
            type="button"
          >×</button>
        </div>

        {/* Mobile tabs */}
        <div className="flex shrink-0 border-b border-[#eadfce] md:hidden">
          {(["items", "billing", "payment"] as MobileTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-xs font-bold capitalize transition ${mobileTab === tab ? "border-b-2 border-primary text-primary" : "text-[#9a9287]"}`}
            >
              {tab === "items" ? "Items" : tab === "billing" ? "Billing" : "Payment"}
            </button>
          ))}
        </div>

        {/* Body — 3-col on md+, tabbed on mobile */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:grid" style={{ gridTemplateColumns: "1fr 300px 360px" }}>

          {/* Left: staples checklist */}
          <div className={`flex flex-col overflow-y-auto border-r border-[#eadfce] p-5 ${mobileTab !== "items" ? "hidden md:flex" : ""}`}>
            <p className="mb-3 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">
              Pantry staples
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <label
                  key={item.name}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                    item.qty > 0
                      ? "border-primary/30 bg-primary/5"
                      : "border-[#eadfce] bg-white hover:bg-[#faf8f5]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={item.qty > 0}
                    onChange={() => toggle(item.name)}
                  />
                  <span className="text-xl">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#2d2a25]">{item.name}</p>
                    <p className="text-xs text-[#9a9287]">${item.price.toFixed(2)}</p>
                  </div>
                  {item.qty > 0 && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20"
                        onClick={() => setQty(item.name, Math.max(0, item.qty - 1))}
                      >−</button>
                      <span className="w-4 text-center text-xs font-bold text-primary">{item.qty}</span>
                      <button
                        type="button"
                        className="grid size-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20"
                        onClick={() => setQty(item.name, item.qty + 1)}
                      >+</button>
                    </div>
                  )}
                  {item.qty === 0 && (
                    <span className="grid size-5 place-items-center rounded-full border-2 border-[#ddd3c5]" />
                  )}
                </label>
              ))}
            </div>

            {/* Summary strip */}
            {hasItems && (
              <div className="mt-4 shrink-0 rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4 text-sm">
                <div className="space-y-1.5">
                  {[
                    ["Subtotal", `$${subtotal.toFixed(2)}`],
                    ["Tax (8.5%)", `$${tax.toFixed(2)}`],
                    ["Delivery", `$${DELIVERY_FEE.toFixed(2)}`],
                    ["Service fee", "Free ✓"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-[#625d52]">{l}</span>
                      <span className={`font-medium ${l === "Service fee" ? "text-primary" : "text-[#2d2a25]"}`}>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#eadfce] pt-2">
                    <span className="font-bold text-[#2d2a25]">Total</span>
                    <span className="font-bold text-primary">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Middle: billing address */}
          <div className={`flex flex-col overflow-y-auto border-r border-[#eadfce] p-5 ${mobileTab !== "billing" ? "hidden md:flex" : ""}`}>
            <p className="mb-3 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Billing address</p>
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="First name" />
                <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Last name" />
              </div>
              <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Street address" />
              <div className="grid grid-cols-3 gap-2">
                <input className="col-span-1 rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="City" />
                <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="State" />
                <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="ZIP" />
              </div>
              <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Country" defaultValue="United States" />
              <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Email address" type="email" />
              <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Phone number" type="tel" />
            </div>
          </div>

          {/* Right: checkout */}
          <div className={`flex flex-col p-5 ${mobileTab !== "payment" ? "hidden md:flex" : ""}`}>
            <p className="mb-4 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Secure payment</p>
            {!hasItems ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="text-4xl">🛒</span>
                <p className="text-sm font-bold text-[#2d2a25]">No items selected</p>
                <p className="text-xs text-[#9a9287]">Select at least one staple on the left to continue.</p>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <NorthCheckout
                  products={products}
                  total={grandTotal}
                  tax={tax}
                  serviceFee={0}
                  sessionEndpoint="/api/north/session"
                  onApproved={handleApproved}
                  onError={() => {}}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
