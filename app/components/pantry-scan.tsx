"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { useIngredients } from "../context/ingredients-context";

const SCAN_SOURCES = [
  {
    key: "refrigerator",
    label: "Refrigerator",
    src: "/demo-assets/pantry-baseline/refrigerator-baseline-mixed-labels.png",
    ingredients: ["Eggs", "Milk", "Heavy Cream", "Parmesan", "Yogurt", "Butter", "Strawberries", "Basil", "Minced Garlic", "Lemons"],
  },
  {
    key: "pantry",
    label: "Pantry",
    src: "/demo-assets/pantry-baseline/pantry-baseline-mixed-labels.png",
    ingredients: ["Spaghetti", "Rice", "Tomatoes", "Olive Oil", "Flour", "Sugar", "Oats", "Peanut Butter", "Pasta Sauce", "Chickpeas", "Oregano", "Turmeric", "Chili", "Basil", "Parsley", "Onion", "Garlic", "Black Pepper"],
  },
  {
    key: "freezer",
    label: "Freezer",
    src: "/demo-assets/pantry-baseline/freezer-baseline-mixed-labels.png",
    ingredients: ["Frozen Peas", "Spinach", "Vanilla Ice Cream", "Frozen Berries", "Mixed Vegetables", "Chicken Breast", "Dumplings"],
  },
];

const ALL_DETECTED = SCAN_SOURCES.flatMap((s) => s.ingredients);

type ScanStatus = "idle" | "scanning" | "done";

export function PantryScan() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [activeScan, setActiveScan] = useState(-1);
  const { setIngredients, ingredients } = useIngredients();

  const runScan = useCallback(() => {
    setStatus("scanning");
    setActiveScan(0);

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step < SCAN_SOURCES.length) {
        setActiveScan(step);
      } else {
        clearInterval(interval);
        setActiveScan(-1);
        setStatus("done");
        const merged = Array.from(new Set([...ingredients, ...ALL_DETECTED]));
        setIngredients(merged);
      }
    }, 1000);
  }, [ingredients, setIngredients]);

  const reset = useCallback(() => {
    setStatus("idle");
    setActiveScan(-1);
  }, []);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-[#eadfce] bg-white/80 p-6 shadow-sm shadow-[#8c6b3f]/5">
      <span className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
        <ScanSparkleIcon />
        Auto Detect
      </span>

      <div className="mt-5">
        <h2 className="[font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
          Scan Your Pantry
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#625d52]">
          Scan your fridge, pantry, and freezer to auto-detect ingredients.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {SCAN_SOURCES.map((source, index) => (
          <div key={source.key} className="relative overflow-hidden rounded-2xl border border-[#eadfce]">
            <div className="relative aspect-[3/4]">
              <Image
                src={source.src}
                alt={source.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 30vw, 200px"
              />
              {status === "scanning" && activeScan === index && (
                <div className="absolute inset-0 flex flex-col">
                  <div className="absolute inset-0 bg-primary/10" />
                  <div className="scan-line absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_2px] shadow-primary/60" />
                </div>
              )}
              {status === "done" && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/80 to-transparent p-2">
                  <span className="text-xs font-bold text-white">
                    {source.ingredients.length} found
                  </span>
                </div>
              )}
            </div>
            <p className="px-2 py-2 text-center text-xs font-bold text-[#625d52]">
              {source.label}
            </p>
          </div>
        ))}
      </div>

      {status === "done" && (
        <div className="mt-5 rounded-2xl border border-[#d4edda] bg-[#f0faf2] px-4 py-3">
          <p className="text-sm font-bold text-primary">
            {ALL_DETECTED.length} ingredients detected
          </p>
          <p className="mt-1 flex flex-wrap gap-1">
            {ALL_DETECTED.map((name) => (
              <span key={name} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {name}
              </span>
            ))}
          </p>
        </div>
      )}

      <div className="mt-5 flex gap-3">
        {status !== "scanning" && (
          <button
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary/90"
            onClick={runScan}
            type="button"
          >
            <ScanIcon />
            {status === "done" ? "Scan Again" : "Scan Now"}
          </button>
        )}
        {status === "scanning" && (
          <div className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary/10 px-5 text-sm font-bold text-primary">
            <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            Scanning…
          </div>
        )}
        {status === "done" && (
          <button
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#ddd3c5] bg-white/70 px-4 text-sm font-bold text-[#625d52] transition hover:bg-white"
            onClick={reset}
            type="button"
          >
            Reset
          </button>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .scan-line {
          animation: scan 1s linear infinite;
        }
      `}</style>
    </article>
  );
}

function ScanIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M7 3H5a2 2 0 0 0-2 2v2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
      <path d="M8 12h8" />
    </svg>
  );
}

function ScanSparkleIcon() {
  return (
    <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
    </svg>
  );
}
