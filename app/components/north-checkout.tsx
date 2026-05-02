"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NorthCheckoutProps = {
  products: Array<{ name: string; price: number; quantity: number }>;
  onApproved: () => void;
  onError: (message: string) => void;
};

declare global {
  interface Window {
    checkout?: {
      mount: (sessionToken: string, containerId: string, opts: { amount: number; tax: number; serviceFee: number }) => Promise<void>;
      submit: () => Promise<Record<string, unknown>>;
      onPaymentComplete?: (cb: (result: Record<string, unknown>) => void) => void;
    };
  }
}

const NORTH_SCRIPT_URL = "https://checkout.north.com/checkout.js";
const CONTAINER_ID = "north-checkout-container";

function loadScript(): Promise<void> {
  if (window.checkout) return Promise.resolve();

  const existing = document.getElementById("north-checkout-js") as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("checkout.js failed to load.")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "north-checkout-js";
    script.src = NORTH_SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.checkout ? resolve() : reject(new Error("checkout.js loaded but window.checkout is missing.")));
    script.onerror = () => reject(new Error("checkout.js failed to load."));
    document.head.appendChild(script);
  });
}

export function NorthCheckout({ products, onApproved, onError }: NorthCheckoutProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "paying" | "approved" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const mountedRef = useRef(false);
  const amountRef = useRef(0);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    async function init() {
      try {
        const res = await fetch("/api/north/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products }),
        });

        const data = await res.json();
        if (!res.ok || !data.sessionToken) throw new Error(data.error || "Could not create checkout session.");

        amountRef.current = data.amount ?? 0;

        await loadScript();

        const container = document.getElementById(CONTAINER_ID);
        if (container) container.innerHTML = "";

        await window.checkout!.mount(data.sessionToken, CONTAINER_ID, {
          amount: data.amount,
          tax: 0,
          serviceFee: 0,
        });

        window.checkout!.onPaymentComplete?.((result) => {
          const s = String(result.status ?? result.authResponseText ?? "").toLowerCase();
          if (s.includes("declined") || s.includes("error") || s.includes("failed")) {
            setStatus("error");
            setErrorMessage("Payment declined. Please try a different card.");
          } else {
            setStatus("approved");
            onApproved();
          }
        });

        setStatus("ready");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Checkout error";
        setErrorMessage(msg);
        setStatus("error");
        onError(msg);
      }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = useCallback(async () => {
    try {
      setStatus("paying");
      await window.checkout!.submit();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setErrorMessage(msg);
      setStatus("error");
      onError(msg);
    }
  }, [onError]);

  return (
    <div className="space-y-4">
      {status === "loading" && (
        <div className="flex min-h-24 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[#625d52]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#eadfce] border-t-primary" />
            Setting up secure checkout…
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-[#fff1e5] px-4 py-3 text-sm text-[#df6040]">
          {errorMessage}
        </div>
      )}

      {status === "approved" && (
        <div className="rounded-2xl bg-primary/10 px-5 py-5 text-center">
          <p className="text-3xl">🎉</p>
          <p className="mt-2 text-sm font-bold text-primary">Order placed!</p>
          <p className="mt-1 text-xs text-[#625d52]">Your ingredients are on their way.</p>
        </div>
      )}

      {/* Always in DOM — North mounts card fields here */}
      <div id={CONTAINER_ID} className={status === "loading" || status === "error" || status === "approved" ? "hidden" : ""} />

      {status === "ready" && (
        <button
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary/90"
          onClick={handlePay}
          type="button"
        >
          <LockIcon />
          Pay ${amountRef.current.toFixed(2)} securely
        </button>
      )}

      {status === "paying" && (
        <div className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary/80 px-4 text-sm font-bold text-white">
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Authorizing…
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <rect width="14" height="11" x="5" y="11" rx="2" />
      <path d="M12 16v2" />
    </svg>
  );
}
