"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useIngredients } from "../context/ingredients-context";

const SCAN_SOURCES = [
  {
    key: "refrigerator",
    label: "Refrigerator",
    src: "/demo-assets/pantry-baseline/refrigerator-baseline-mixed-labels.png",
    ingredients: ["Eggs", "Milk", "Butter", "Yogurt"],
  },
  {
    key: "pantry",
    label: "Pantry",
    src: "/demo-assets/pantry-baseline/pantry-baseline-mixed-labels.png",
    ingredients: ["Rice", "Olive Oil", "Salt", "Black Pepper", "Garlic", "Onion", "Flour", "Sugar", "Soy Sauce"],
  },
  {
    key: "freezer",
    label: "Freezer",
    src: "/demo-assets/pantry-baseline/freezer-baseline-mixed-labels.png",
    ingredients: ["Frozen Peas", "Mixed Vegetables"],
  },
];

const ALL_DETECTED = SCAN_SOURCES.flatMap((s) => s.ingredients);

type ScanStatus = "idle" | "scanning" | "done";
type CameraStatus = "idle" | "uploading" | "done" | "error";

export function PantryScan() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [activeScan, setActiveScan] = useState(-1);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraIngredients, setCameraIngredients] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setIngredients, ingredients } = useIngredients();
  // Keep a ref so async callbacks always see the latest ingredients list
  const ingredientsRef = useRef(ingredients);
  ingredientsRef.current = ingredients;

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
        const merged = Array.from(new Set([...ingredientsRef.current, ...ALL_DETECTED]));
        setIngredients(merged);
      }
    }, 1000);
  }, [setIngredients]);

  const reset = useCallback(() => {
    setStatus("idle");
    setActiveScan(-1);
    setCameraStatus("idle");
    setCameraIngredients([]);
    setCameraError("");
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    setCameraStatus("uploading");
    setCameraError("");

    // Compress client-side: resize to max 1200px and re-encode as JPEG ~85%
    // Cuts typical phone photos from 3-6 MB down to ~300 KB with no accuracy loss
    let uploadFile: File = file;
    try {
      const compressed = await compressImage(file, 1200, 0.85);
      uploadFile = new File([compressed], file.name, { type: "image/jpeg" });
    } catch { /* if canvas fails, send original */ }

    const formData = new FormData();
    formData.append("image", uploadFile);
    try {
      const res = await fetch("/api/pantry/scan", { method: "POST", body: formData });
      const data = await res.json() as { ingredients?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      const detected: string[] = Array.isArray(data.ingredients) ? data.ingredients : [];
      setCameraIngredients(detected);
      setCameraStatus("done");
      const merged = Array.from(new Set([...ingredientsRef.current, ...detected]));
      setIngredients(merged);
    } catch (err) {
      setCameraError(err instanceof Error ? err.message : "Scan failed");
      setCameraStatus("error");
    }
  }, [setIngredients]);

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

      {/* ── Take a photo with AI Vision ─────────────────────────── */}
      <div className="mt-5 border-t border-[#eadfce] pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9a9287]">
          Or scan with your camera
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFileUpload(file);
            e.target.value = "";
          }}
        />

        <button
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/70 px-4 text-sm font-bold text-[#2d2a25] transition hover:bg-white disabled:opacity-60"
          onClick={() => fileInputRef.current?.click()}
          disabled={cameraStatus === "uploading"}
          type="button"
        >
          {cameraStatus === "uploading" ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-[#ddd3c5] border-t-primary" />
              Scanning photo…
            </>
          ) : (
            <>
              <CameraIcon />
              Take a Photo
            </>
          )}
        </button>

        {cameraStatus === "done" && cameraIngredients.length > 0 && (
          <div className="mt-3 rounded-2xl border border-[#d4edda] bg-[#f0faf2] px-4 py-3">
            <p className="text-sm font-bold text-primary">
              {cameraIngredients.length} ingredients detected by AI
            </p>
            <p className="mt-1 flex flex-wrap gap-1">
              {cameraIngredients.map((name) => (
                <span key={name} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                  {name}
                </span>
              ))}
            </p>
          </div>
        )}

        {cameraStatus === "done" && cameraIngredients.length === 0 && (
          <p className="mt-2 text-xs text-[#9a9287]">No ingredients detected — try a clearer photo.</p>
        )}

        {cameraStatus === "error" && (
          <p className="mt-2 text-xs text-[#df6040]">{cameraError}</p>
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

function compressImage(file: File, maxPx: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("no canvas context")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("toBlob failed")),
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
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

function CameraIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
