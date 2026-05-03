"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NorthCheckoutProps = {
  products: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  tax: number;
  serviceFee: number;
  onApproved: (result: Record<string, unknown>) => void;
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

function isPaymentSuccessful(result: Record<string, unknown>) {
  const status = String(result.status ?? result.paymentStatus ?? result.authResponseText ?? "").toLowerCase();
  if (status.includes("declined") || status.includes("error") || status.includes("failed")) return false;
  if (status.includes("approved") || status.includes("success")) return true;
  if ("success" in result) return Boolean(result.success);
  if ("approved" in result) return Boolean(result.approved);
  return true;
}

export function NorthCheckout({ products, total, tax, serviceFee, onApproved, onError }: NorthCheckoutProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "paying" | "approved" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const mountedRef = useRef(false);
  // Prevents double-firing when both onPaymentComplete and submit() resolve
  const completedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    async function init() {
      try {
        const res = await fetch("/api/north/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products, tax, serviceFee, total }),
        });

        const data = await res.json();
        if (!res.ok || !data.sessionToken) throw new Error(data.error || "Could not create checkout session.");

        await loadScript();

        const container = document.getElementById(CONTAINER_ID);
        if (container) container.innerHTML = "";

        // Wire up onPaymentComplete BEFORE mount so Apple Pay / Google Pay
        // wallet completions (which bypass submit()) are caught.
        window.checkout!.onPaymentComplete?.((result) => {
          if (completedRef.current) return;
          completedRef.current = true;
          if (isPaymentSuccessful(result)) {
            setStatus("approved");
            onApproved(result);
          } else {
            const msg = String(result.authResponseText ?? result.status ?? "Payment declined");
            setErrorMessage(msg);
            setStatus("error");
            onError(msg);
          }
        });

        // Set up allow="payment" observer before mount — Safari 17+ requires it.
        const applyPaymentAllow = (root: Element) => {
          root.querySelectorAll("iframe").forEach((f) => {
            if (!f.getAttribute("allow")?.includes("payment")) {
              f.setAttribute(
                "allow",
                [f.getAttribute("allow"), "payment"].filter(Boolean).join("; "),
              );
            }
          });
        };
        if (container) {
          const observer = new MutationObserver(() => applyPaymentAllow(container));
          observer.observe(container, { childList: true, subtree: true });
        }

        await window.checkout!.mount(data.sessionToken, CONTAINER_ID, {
          amount: data.amount,
          tax: data.tax,
          serviceFee: data.serviceFee,
        });

        if (container) applyPaymentAllow(container);

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
      const result = await window.checkout!.submit();
      // onPaymentComplete may have already handled this
      if (completedRef.current) return;
      completedRef.current = true;
      if (!isPaymentSuccessful(result)) throw new Error("Payment was not approved.");
      setStatus("approved");
      onApproved(result);
    } catch (err) {
      if (completedRef.current) return;
      const msg = err instanceof Error ? err.message : "Payment failed";
      setErrorMessage(msg);
      setStatus("error");
      onError(msg);
    }
  }, [onApproved, onError]);

  if (status === "approved") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-3 text-base font-bold text-primary">Order placed!</p>
        <p className="mt-1 text-sm text-[#625d52]">Your ingredients are on their way.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl bg-[#fff1e5] px-4 py-3 text-sm text-[#df6040]">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {status === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[#625d52]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#eadfce] border-t-primary" />
            Setting up secure checkout…
          </div>
        </div>
      )}

      <div id={CONTAINER_ID} className={`flex-1${status === "loading" ? " hidden" : ""}`} style={{ minHeight: 460 }} />

      {status === "ready" && (
        <button
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary/90"
          onClick={handlePay}
          type="button"
        >
          <LockIcon />
          Pay ${total.toFixed(2)} securely
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
    </svg>
  );
}
