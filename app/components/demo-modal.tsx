"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    emoji: "📸",
    label: "Step 1",
    title: "Scan Your Pantry",
    subtitle: "AI reads your fridge in seconds",
    description:
      "Take a photo of your fridge, freezer, or pantry. Our AI instantly identifies every ingredient — no typing required.",
    cta: { label: "Try pantry scan →", href: "/pantry" },
    accent: "#385026",
    bg: "#f0f5e8",
    mockup: "pantry",
  },
  {
    emoji: "🍳",
    label: "Step 2",
    title: "Get Recipe Ideas",
    subtitle: "Matched to what you already have",
    description:
      "We suggest recipes based on your pantry. See exactly which ingredients you have, which are missing, and how to substitute.",
    cta: { label: "Browse recipes →", href: "/dashboard" },
    accent: "#df6040",
    bg: "#fff1ec",
    mockup: "recipe",
  },
  {
    emoji: "🚚",
    label: "Step 3",
    title: "Order Missing Items",
    subtitle: "Delivered in under an hour",
    description:
      "Missing a few ingredients? Pay securely with Apple Pay or card and DoorDash delivers straight to your door.",
    cta: { label: "See a recipe →", href: "/recipes/1" },
    accent: "#d79a20",
    bg: "#fffbee",
    mockup: "delivery",
  },
];

type Props = { onClose: () => void };

export function DemoModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 4000;

  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        setStep((s) => (s + 1) % STEPS.length);
      }
    }, 30);
    return () => clearInterval(intervalRef.current!);
  }, [step, paused]);

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ maxHeight: "90vh" }}
      >
        {/* Close */}
        <button
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-xl border border-[#eadfce] bg-white text-xl text-[#625d52] hover:bg-[#fff6ee]"
          onClick={onClose}
        >×</button>

        {/* Coloured header band */}
        <div
          className="flex flex-col items-center px-8 pb-6 pt-8 text-center transition-colors duration-500"
          style={{ backgroundColor: current.bg }}
        >
          <span className="text-5xl">{current.emoji}</span>
          <p className="mt-3 text-xs font-bold uppercase tracking-widest" style={{ color: current.accent }}>
            {current.label}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#2d2a25]">{current.title}</h2>
          <p className="mt-1 text-sm text-[#625d52]">{current.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-[#eadfce]">
          <div
            className="h-full transition-[width] duration-75"
            style={{ width: `${progress}%`, backgroundColor: current.accent }}
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 p-7 md:flex-row md:items-start">
          {/* Description + CTA */}
          <div className="flex flex-1 flex-col justify-between gap-6">
            <p className="text-[15px] leading-7 text-[#403d36]">{current.description}</p>
            <Link
              href={current.cta.href}
              onClick={onClose}
              className="inline-flex h-11 w-fit items-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: current.accent }}
            >
              {current.cta.label}
            </Link>
          </div>

          {/* Mock UI */}
          <div className="w-full shrink-0 md:w-64">
            {current.mockup === "pantry" && <PantryMockup />}
            {current.mockup === "recipe" && <RecipeMockup />}
            {current.mockup === "delivery" && <DeliveryMockup />}
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pb-5">
          {STEPS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => { setStep(i); setProgress(0); }}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                backgroundColor: i === step ? current.accent : "#ddd3c5",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PantryMockup() {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">Pantry AI Scan</p>
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#f0f5e8] px-3 py-2">
        <span className="text-lg">📷</span>
        <div>
          <p className="text-xs font-bold text-[#385026]">Scanning fridge…</p>
          <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[#d8e4c3]">
            <div className="h-full w-4/5 rounded-full bg-[#385026] animate-pulse" />
          </div>
        </div>
      </div>
      {[
        { name: "Tomatoes", found: true },
        { name: "Garlic", found: true },
        { name: "Olive Oil", found: true },
        { name: "Pasta", found: false },
      ].map((item) => (
        <div key={item.name} className="flex items-center justify-between py-1.5 text-xs">
          <span className="text-[#2d2a25]">{item.name}</span>
          <span className={`font-bold ${item.found ? "text-[#385026]" : "text-[#b5a99a]"}`}>
            {item.found ? "✓ Found" : "Not found"}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecipeMockup() {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">Top Match</p>
      <div className="rounded-xl border border-[#eadfce] bg-white p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-[#2d2a25]">Creamy Garlic Pasta</p>
            <p className="mt-0.5 text-xs text-[#625d52]">25 min · Easy</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#f0f5e8] px-2 py-0.5 text-[10px] font-bold text-[#385026]">94%</span>
        </div>
        <div className="mt-3 flex gap-1 flex-wrap">
          {["Garlic ✓", "Pasta ✓", "Cream ✓"].map((t) => (
            <span key={t} className="rounded-full bg-[#f0f5e8] px-2 py-0.5 text-[10px] text-[#385026]">{t}</span>
          ))}
          <span className="rounded-full bg-[#fff1ec] px-2 py-0.5 text-[10px] text-[#df6040]">Basil ✗</span>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-[#9a9287]">+ 11 more recipes found</p>
    </div>
  );
}

function DeliveryMockup() {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-[#faf8f5] p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#9a9287]">Live Delivery</p>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#fffbee] text-base">🛵</span>
        <div>
          <p className="text-xs font-bold text-[#2d2a25]">Alex M. · ⭐ 4.9</p>
          <p className="text-[10px] text-[#625d52]">Toyota Camry</p>
        </div>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#eadfce]">
        <div className="absolute left-0 top-0 h-full w-4/5 rounded-full bg-[#d79a20]" />
      </div>
      <div className="mt-2 flex justify-between text-[9px] font-bold text-[#9a9287]">
        <span className="text-[#d79a20]">Placed</span>
        <span className="text-[#d79a20]">Pickup</span>
        <span className="text-[#d79a20]">On way</span>
        <span>Delivered</span>
      </div>
      <p className="mt-3 text-center text-xs font-bold text-[#d79a20]">ETA ~12 min</p>
    </div>
  );
}
