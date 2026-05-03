"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NorthCheckout } from "../../components/north-checkout";
import type { RecipeIngredient } from "./recipe-ingredients-panel";

const TAX_RATE = 0.085;
const SERVICE_FEE = 2.99;
const DELIVERY_FEE = 4.99;
const POLL_INTERVAL_MS = 8000;

// DoorDash delivery_status values → human labels + progress (0-100)
const STATUS_MAP: Record<string, { label: string; progress: number; emoji: string }> = {
  created:              { label: "Order placed",       progress: 10,  emoji: "✅" },
  enroute_to_pickup:   { label: "Dasher heading to store", progress: 30, emoji: "🛵" },
  arrived_at_pickup:   { label: "Dasher at store",    progress: 45,  emoji: "🏪" },
  picked_up:           { label: "Order picked up",    progress: 60,  emoji: "📦" },
  enroute_to_dropoff:  { label: "On the way to you",  progress: 80,  emoji: "🚀" },
  arrived_at_dropoff:  { label: "Dasher at your door",progress: 95,  emoji: "🚪" },
  delivered:           { label: "Delivered!",         progress: 100, emoji: "🎉" },
  delivery_cancelled:  { label: "Delivery cancelled", progress: 0,   emoji: "❌" },
};

type DeliveryResult = {
  simulated: boolean;
  delivery_id: string;
  status: string;
  tracking_url: string | null;
  dasher?: { name: string; rating?: number; vehicle?: string } | null;
  estimated_pickup_time?: string | null;
  estimated_delivery_time?: string | null;
};

type RefundState = "idle" | "processing" | "done" | "error";
type ModalPhase = "checkout" | "confirmed";

type MissingIngredientsModalProps = {
  ingredients: RecipeIngredient[];
  isOpen: boolean;
  onClose: () => void;
};

export function MissingIngredientsModal({ ingredients, isOpen, onClose }: MissingIngredientsModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("checkout");
  const [delivery, setDelivery] = useState<DeliveryResult | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState("created");
  const [authGuid, setAuthGuid] = useState("");
  const [refundState, setRefundState] = useState<RefundState>("idle");
  const [refundError, setRefundError] = useState("");

  // Reset to fresh checkout state every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      setPhase("checkout");
      setDelivery(null);
      setDeliveryStatus("created");
      setAuthGuid("");
      setRefundState("idle");
      setRefundError("");
    }
  }, [isOpen]);

  const [address, setAddress] = useState("350 5th Ave, New York, NY 10118");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addrBoxRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const products = ingredients.map((i) => ({
    name: i.name,
    price: i.price ?? 2.99,
    quantity: 1,
  }));
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount + SERVICE_FEE + DELIVERY_FEE;

  // Close address suggestions on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (addrBoxRef.current && !addrBoxRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Poll DoorDash delivery status while confirmed
  useEffect(() => {
    if (phase !== "confirmed" || !delivery) return;
    const poll = async () => {
      try {
        const res = await fetch(`/api/doorstep/status?id=${delivery.delivery_id}`);
        const data = await res.json();
        if (data.status) setDeliveryStatus(data.status);
      } catch { /* ignore */ }
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [phase, delivery]);

  // Auto-trigger refund when DoorDash cancels
  useEffect(() => {
    if (
      deliveryStatus === "delivery_cancelled" &&
      refundState === "idle" &&
      authGuid
    ) {
      handleRefund();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryStatus]);

  const handleAddressChange = useCallback((val: string) => {
    setAddress(val);
    setShowSugg(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=6&countrycodes=us`,
        );
        const data: Array<{ display_name: string }> = await res.json();
        const names = data.map((r) => r.display_name);
        setSuggestions(names);
        if (names.length > 0) setShowSugg(true);
      } catch { setSuggestions([]); }
    }, 380);
  }, []);

  const handleApproved = useCallback(async (paymentResult: Record<string, unknown>) => {
    // Extract auth GUID — North may return it under several field names
    const guid = String(
      paymentResult.authGuid ??
      paymentResult.auth_guid ??
      paymentResult.orig_auth_guid ??
      paymentResult.transactionId ??
      paymentResult.transaction_id ??
      paymentResult.referenceNumber ??
      "",
    );
    setAuthGuid(guid);

    let result: DeliveryResult;
    try {
      const res = await fetch("/api/doorstep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryAddress: address,
          items: products.map((p) => p.name),
          orderTotal: grandTotal,
        }),
      });
      result = await res.json();
    } catch {
      result = {
        simulated: true,
        delivery_id: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: "created",
        tracking_url: null,
        dasher: null,
        estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      };
    }
    setDelivery(result);
    setDeliveryStatus(result.status ?? "created");
    setPhase("confirmed");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, grandTotal]);

  const handleRefund = useCallback(async () => {
    setRefundState("processing");
    try {
      const res = await fetch("/api/north/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authGuid, amount: grandTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refund failed");
      setRefundState("done");
    } catch (err) {
      setRefundError(err instanceof Error ? err.message : "Refund failed");
      setRefundState("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authGuid, grandTotal]);

  if (!isOpen) return null;

  // ── Confirmation / tracking screen ─────────────────────────────────────────
  if (phase === "confirmed" && delivery) {
    const statusInfo = STATUS_MAP[deliveryStatus] ?? { label: deliveryStatus, progress: 20, emoji: "🚚" };
    const cancelled = deliveryStatus === "delivery_cancelled";
    const delivered = deliveryStatus === "delivered";
    const eta = delivery.estimated_delivery_time
      ? new Date(delivery.estimated_delivery_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "~45 min";

    const STEPS = ["Placed", "Pickup", "On the way", "Delivered"];

    return (
      <div
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 p-4"
        role="dialog"
      >
        <div className="flex w-full max-w-xl flex-col gap-0 overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl shadow-[#2d2a25]/20" style={{ maxHeight: "92vh" }}>

          {/* ── Top banner ── */}
          <div className={`flex items-center gap-3 px-6 py-5 ${cancelled ? "bg-red-50" : delivered ? "bg-[#f0faf2]" : "bg-[#fff6ee]"}`}>
            <span className="text-3xl">{statusInfo.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#2d2a25] text-base">{statusInfo.label}</p>
              <p className="text-xs text-[#9a9287] truncate">Order {delivery.delivery_id}</p>
            </div>
            {/* Live pulse dot while in transit */}
            {!cancelled && !delivered && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                Live
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto p-6">

            {/* Progress bar + steps */}
            {!cancelled && (
              <div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#eadfce]">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${statusInfo.progress}%` }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-4 text-center">
                  {STEPS.map((step, i) => {
                    const stepPct = [10, 45, 70, 100][i];
                    const active = statusInfo.progress >= stepPct;
                    return (
                      <span key={step} className={`text-[10px] font-bold ${active ? "text-primary" : "text-[#b5a99a]"}`}>
                        {step}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ETA + address row */}
            {!cancelled && (
              <div className="flex items-center justify-between rounded-2xl bg-[#fff6ee] px-4 py-3 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">ETA</p>
                  <p className="text-lg font-bold text-primary">{delivered ? "Delivered!" : eta}</p>
                </div>
                <div className="min-w-0 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">Delivering to</p>
                  <p className="max-w-[220px] truncate text-sm font-bold text-[#2d2a25]">{address}</p>
                </div>
              </div>
            )}

            {/* Dasher card */}
            {delivery.dasher ? (
              <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">Your Dasher</p>
                <div className="flex items-center gap-3">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl">🛵</div>
                  <div className="flex-1">
                    <p className="font-bold text-[#2d2a25]">{delivery.dasher.name}</p>
                    {delivery.dasher.vehicle && <p className="text-xs text-[#625d52]">{delivery.dasher.vehicle}</p>}
                  </div>
                  {delivery.dasher.rating && (
                    <span className="flex items-center gap-1 rounded-xl bg-[#fff6ee] px-2.5 py-1.5 text-sm font-bold text-primary">
                      ⭐ {delivery.dasher.rating}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#eadfce] bg-[#faf8f5] p-4 text-center">
                <p className="text-xs text-[#9a9287]">Dasher will be assigned shortly…</p>
              </div>
            )}

            {/* DoorDash live tracking link — prominent */}
            {delivery.tracking_url && (
              <a
                href={delivery.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white px-4 py-3.5 transition hover:bg-[#fff6ee]"
              >
                <span className="text-2xl">📍</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#2d2a25]">Track live on DoorDash</p>
                  <p className="text-xs text-[#9a9287] truncate">{delivery.tracking_url}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-primary">Open →</span>
              </a>
            )}

            {/* Cancellation + refund */}
            {cancelled && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="font-bold text-red-600">Delivery was cancelled</p>
                <p className="mt-1 text-sm text-red-500">
                  {refundState === "done"
                    ? `✅ Refund of $${grandTotal.toFixed(2)} has been issued to your card.`
                    : refundState === "processing"
                    ? "Processing refund…"
                    : refundState === "error"
                    ? `Refund error: ${refundError}`
                    : authGuid
                    ? "Issuing refund automatically…"
                    : `A refund of $${grandTotal.toFixed(2)} will be issued.`}
                </p>
                {refundState === "error" && (
                  <button
                    className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                    onClick={handleRefund}
                  >Retry Refund</button>
                )}
              </div>
            )}

            {/* Items ordered */}
            <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">Items ordered</p>
              <div className="flex flex-wrap gap-1.5">
                {products.map((p) => (
                  <span key={p.name} className="rounded-full bg-white border border-[#eadfce] px-2.5 py-1 text-xs font-medium text-[#2d2a25]">
                    {p.name}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-[#eadfce] pt-2.5 text-sm">
                <span className="text-[#625d52]">Total charged</span>
                <span className="font-bold text-[#2d2a25]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {delivery.simulated && (
              <p className="text-center text-xs text-[#b5a99a]">
                Demo mode — add <code className="rounded bg-[#f5ece0] px-1">DOORDASH_*</code> env vars for real dispatch
              </p>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 border-t border-[#eadfce] px-6 py-4">
            <div className="flex gap-3">
              {delivery.tracking_url && !cancelled && (
                <a
                  href={delivery.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary bg-white text-sm font-bold text-primary hover:bg-primary/5"
                >
                  Track live →
              </a>
                )}
              <button
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90"
                onClick={onClose}
              >
                {cancelled ? "Close" : delivered ? "Done" : "Minimize"}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── Checkout screen (3 columns) ─────────────────────────────────────────────
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a25]/50 p-3"
      role="dialog"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-3xl border border-[#eadfce] bg-white shadow-2xl shadow-[#2d2a25]/20"
        style={{ maxWidth: "min(98vw, 1520px)", maxHeight: "94vh" }}
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
          >×</button>
        </div>

        {/* 3-column body */}
        <div className="grid min-h-0 flex-1 overflow-hidden" style={{ gridTemplateColumns: "300px 340px 1fr" }}>

          {/* ── Left: cart ─────────────────────────── */}
          <div className="flex flex-col overflow-y-auto border-r border-[#eadfce] p-5">
            <p className="mb-3 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Your cart</p>
            <ul className="flex-1 divide-y divide-[#f5ece0]">
              {products.map((p) => (
                <li key={p.name} className="flex items-center justify-between py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#fff1e5] text-xs">🛒</span>
                    <span className="truncate text-sm font-medium text-[#2d2a25]">{p.name}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-sm font-bold text-[#2d2a25]">${p.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex shrink-0 items-center justify-between rounded-2xl bg-[#fff6ee] px-3 py-2.5">
              <span className="text-xs font-bold text-[#2d2a25]">Subtotal</span>
              <span className="text-sm font-bold text-primary">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Middle: order details + address ──────── */}
          <div className="flex flex-col overflow-y-auto border-r border-[#eadfce] p-5">
            <p className="mb-4 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Order details</p>

            <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
              <div className="space-y-2.5 text-sm">
                {[
                  ["Subtotal", `$${subtotal.toFixed(2)}`],
                  ["Tax (8.5%)", `$${taxAmount.toFixed(2)}`],
                  ["Service fee", `$${SERVICE_FEE.toFixed(2)}`],
                  ["Delivery", `$${DELIVERY_FEE.toFixed(2)}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-[#625d52]">{label}</span>
                    <span className="font-medium text-[#2d2a25]">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-[#eadfce] pt-2.5">
                  <span className="font-bold text-[#2d2a25]">Total</span>
                  <span className="text-base font-bold text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#eadfce] bg-[#f0faf2] px-4 py-3">
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <div>
                  <p className="text-xs font-bold text-primary">Estimated delivery</p>
                  <p className="text-xs text-[#625d52]">~45 min after order</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label className="text-xs font-bold text-[#2d2a25]">Delivery address</label>
              <div ref={addrBoxRef} className="relative">
                <input
                  className="w-full rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Start typing your address…"
                  value={address}
                  autoComplete="off"
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                />
                {showSugg && suggestions.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#eadfce] bg-white shadow-xl">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="cursor-pointer px-3 py-2.5 text-xs text-[#2d2a25] hover:bg-[#fff6ee] first:rounded-t-xl last:rounded-b-xl"
                        onMouseDown={(e) => { e.preventDefault(); setAddress(s); setShowSugg(false); setSuggestions([]); }}
                      >{s}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Apt / unit" />
                <input className="rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="ZIP code" />
              </div>
              <textarea
                className="w-full resize-none rounded-xl border border-[#ddd3c5] bg-white px-3 py-2.5 text-sm text-[#2d2a25] placeholder:text-[#b5a99a] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="Delivery instructions (optional)"
                rows={2}
              />
            </div>
          </div>

          {/* ── Right: North checkout ─────────────────── */}
          <div className="flex flex-col p-5">
            <p className="mb-4 shrink-0 text-xs font-bold uppercase tracking-wide text-[#9a9287]">Secure payment</p>
            <div className="flex min-h-0 flex-1 flex-col">
              <NorthCheckout
                products={products}
                total={grandTotal}
                tax={taxAmount}
                serviceFee={SERVICE_FEE}
                onApproved={handleApproved}
                onError={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
