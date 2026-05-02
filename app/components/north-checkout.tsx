"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type NorthCheckoutProps = {
  products: Array<{ name: string; price: number; quantity: number }>;
  onApproved: () => void;
  onError: (message: string) => void;
};

declare global {
  interface Window {
    NorthCheckout?: {
      init: (config: { sessionToken: string; containerId?: string }) => void;
    };
  }
}

export function NorthCheckout({ products, onApproved, onError }: NorthCheckoutProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "paying" | "approved" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!scriptLoaded || mountedRef.current) return;
    mountedRef.current = true;

    async function initCheckout() {
      try {
        const res = await fetch("/api/north/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products }),
        });

        const data = await res.json();

        if (!res.ok || !data.sessionToken) {
          throw new Error(data.error || "Could not start checkout.");
        }

        if (window.NorthCheckout) {
          window.NorthCheckout.init({
            sessionToken: data.sessionToken,
            containerId: "north-checkout-container",
          });
          setStatus("ready");
        } else {
          throw new Error("North checkout script not available.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Checkout error";
        setErrorMessage(msg);
        setStatus("error");
        onError(msg);
      }
    }

    initCheckout();
  }, [scriptLoaded, products, onError]);

  useEffect(() => {
    function handleApproved() {
      setStatus("approved");
      onApproved();
    }

    window.addEventListener("north:approved", handleApproved);
    return () => window.removeEventListener("north:approved", handleApproved);
  }, [onApproved]);

  return (
    <>
      <Script
        src="https://checkout.north.com/js/embed.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setStatus("error");
          setErrorMessage("Failed to load payment script.");
          onError("Failed to load payment script.");
        }}
      />

      {status === "loading" && (
        <div className="flex min-h-32 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[#625d52]">
            <span className="size-4 animate-spin rounded-full border-2 border-[#eadfce] border-t-primary" />
            Setting up checkout…
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-[#fff1e5] px-4 py-3 text-sm text-[#df6040]">
          {errorMessage}
        </div>
      )}

      {status === "approved" && (
        <div className="rounded-2xl bg-primary/10 px-4 py-4 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-1 text-sm font-bold text-primary">Order placed!</p>
          <p className="mt-1 text-xs text-[#625d52]">Your ingredients are on their way.</p>
        </div>
      )}

      {/* Always in DOM so North can mount into it before status updates */}
      <div
        id="north-checkout-container"
        className={status === "loading" || status === "error" || status === "approved" ? "hidden" : "block"}
      />
    </>
  );
}
