"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PantryRestockModal } from "../components/pantry-restock-modal";
import { PantryScan } from "../components/pantry-scan";
import { useIngredients } from "../context/ingredients-context";
import { IngredientsTable } from "./ingredients-table";

export default function PantryPage() {
  const { addIngredient, ingredients, removeIngredient } = useIngredients();
  const [restockOpen, setRestockOpen] = useState(false);
  const [ingredientSuggestions, setIngredientSuggestions] = useState<string[]>(
    [],
  );
  const [newIngredient, setNewIngredient] = useState("");
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadIngredientSuggestions() {
      try {
        const response = await fetch("/api/ingredients");

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { ingredients?: unknown };

        if (!isMounted || !Array.isArray(data.ingredients)) {
          return;
        }

        setIngredientSuggestions(
          data.ingredients.filter(
            (ingredient): ingredient is string =>
              typeof ingredient === "string",
          ),
        );
      } catch {
        setIngredientSuggestions([]);
      }
    }

    loadIngredientSuggestions();

    return () => {
      isMounted = false;
    };
  }, []);

  const suggestedIngredients = useMemo(() => {
    const normalizedIngredient = newIngredient.trim().toLowerCase();
    const uniqueSuggestions = Array.from(
      new Map(
        ingredientSuggestions.map((ingredient) => [
          ingredient.trim().toLowerCase(),
          ingredient.trim(),
        ]),
      ).values(),
    ).filter(Boolean);

    return uniqueSuggestions
      .filter((ingredient) => {
        if (!normalizedIngredient) {
          return true;
        }

        return ingredient.toLowerCase().includes(normalizedIngredient);
      })
      .slice(0, 6);
  }, [ingredientSuggestions, newIngredient]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newIngredient.trim()) {
      return;
    }

    addIngredient(newIngredient);
    setNewIngredient("");
    setIsAutocompleteOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#FEF9F5] text-primary">
      <PantryNavbar />

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-12 lg:px-8">
        <section className="pt-4">
          <h1 className="[font-family:var(--font-noto-serif)] text-4xl font-bold tracking-tight text-[#2d2a25] sm:text-5xl">
            Pantry
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625d52] sm:text-base">
            Keep track of your ingredients and quickly add anything new to your
            local pantry.
          </p>
        </section>

        {/* Restock banner */}
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#eadfce] bg-white/80 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛒</span>
            <div>
              <p className="text-sm font-bold text-[#2d2a25]">Running low on staples?</p>
              <p className="text-xs text-[#625d52]">Order olive oil, garlic, eggs and more — no service fee.</p>
            </div>
          </div>
          <button
            className="shrink-0 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-sm transition hover:bg-primary/90"
            onClick={() => setRestockOpen(true)}
            type="button"
          >
            <RestockIcon />
            Restock Pantry
          </button>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.96fr_1fr]">
          <PantryScan />

          <article className="rounded-3xl border border-[#f2dfcf] bg-[#fffaf4] p-6 shadow-sm shadow-[#8c6b3f]/5">
            <span className="inline-flex rounded-xl bg-[#fff1e5] px-3 py-1.5 text-xs font-bold text-[#df6040]">
              Manual Entry
            </span>
            <h2 className="mt-8 [font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
              Add Ingredient Manually
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#625d52]">
              Add ingredients one by one to keep your pantry ready for recipe
              recommendations.
            </p>

            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
            >
              <label className="sr-only" htmlFor="pantry-ingredient">
                Ingredient name
              </label>
              <div className="relative min-w-0 flex-1">
                <input
                  aria-autocomplete="list"
                  aria-controls="pantry-ingredient-suggestions"
                  aria-expanded={isAutocompleteOpen && suggestedIngredients.length > 0}
                  className="h-12 w-full rounded-xl border border-[#eadfce] bg-white px-4 text-sm font-bold text-[#2d2a25] outline-none placeholder:text-[#a39a8f] focus:border-primary"
                  id="pantry-ingredient"
                  onBlur={() => setIsAutocompleteOpen(false)}
                  onChange={(event) => {
                    setNewIngredient(event.target.value);
                    setIsAutocompleteOpen(true);
                  }}
                  onFocus={() => setIsAutocompleteOpen(true)}
                  placeholder="e.g. Eggs, Milk, Olive Oil"
                  role="combobox"
                  type="text"
                  value={newIngredient}
                />
                {isAutocompleteOpen && suggestedIngredients.length > 0 && (
                  <div
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-xl shadow-[#8c6b3f]/10"
                    id="pantry-ingredient-suggestions"
                    role="listbox"
                  >
                    {suggestedIngredients.map((ingredient) => (
                      <button
                        aria-selected={ingredient === newIngredient}
                        className="block w-full px-4 py-3 text-left text-sm font-bold text-[#2d2a25] transition hover:bg-[#fff6ee]"
                        key={ingredient}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setNewIngredient(ingredient);
                          setIsAutocompleteOpen(false);
                        }}
                        role="option"
                        type="button"
                      >
                        {ingredient}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#df6040] px-5 text-sm font-bold text-white shadow-md shadow-[#df6040]/15 transition hover:bg-[#c94d31]"
                type="submit"
              >
                Add Ingredient
                <PlusIcon />
              </button>
            </form>
          </article>
        </section>

        <IngredientsTable
          ingredients={ingredients}
          onRemoveIngredient={removeIngredient}
        />
      </main>

      <PantryRestockModal isOpen={restockOpen} onClose={() => setRestockOpen(false)} />
    </div>
  );
}

function PantryNavbar() {
  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard", label: "Recipes" },
    { href: "/pantry", label: "Pantry" },
    { href: "#", label: "Community" },
    { href: "#", label: "Shop" },
  ];

  return (
    <header className="mx-auto flex w-full max-w-[1500px] items-center gap-5 px-4 py-5 lg:px-8">
      <Link className="mr-3 leading-none" href="/">
        <span className="block [font-family:var(--font-noto-serif)] text-3xl font-bold tracking-tight text-primary">
          recipe
        </span>
        <span className="-mt-2 block text-3xl font-bold italic tracking-tight text-[#df6040]">
          remix
        </span>
      </Link>

      <nav className="hidden flex-1 items-center gap-2 rounded-2xl md:flex">
        {links.map((link) => (
          <Link
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              link.label === "Pantry"
                ? "bg-[#f1ede5] text-primary"
                : "text-[#2d2a25] hover:bg-white/70"
            }`}
            href={link.href}
            key={link.label}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <label className="hidden h-12 min-w-72 items-center gap-3 rounded-xl border border-[#ddd3c5] bg-white/75 px-4 text-[#8f887c] shadow-sm lg:flex">
        <input
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9a9287]"
          placeholder="Search recipes, ingredients..."
          type="search"
        />
        <SearchIcon />
      </label>

      <button
        aria-label="Notifications"
        className="ml-auto grid size-11 place-items-center rounded-xl border border-[#ddd3c5] bg-white/75 text-[#2d2a25] md:ml-0"
        type="button"
      >
        <BellIcon />
      </button>
      <button
        className="hidden items-center gap-2 rounded-full bg-white/75 p-1 pr-3 text-sm font-bold text-[#2d2a25] md:flex"
        type="button"
      >
        <span className="grid size-10 place-items-center rounded-full bg-[#e9d8c2] text-primary">
          S
        </span>
        <ChevronDownIcon />
      </button>
    </header>
  );
}

function IconSvg({
  children,
  className = "size-4",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

function BellIcon() {
  return (
    <IconSvg className="size-5">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </IconSvg>
  );
}

function ChevronDownIcon() {
  return (
    <IconSvg className="size-4">
      <path d="m6 9 6 6 6-6" />
    </IconSvg>
  );
}

function PlusIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconSvg>
  );
}

function SearchIcon() {
  return (
    <IconSvg className="size-5 shrink-0">
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="m21 21-4.3-4.3" />
    </IconSvg>
  );
}

function SparkleIcon() {
  return (
    <IconSvg className="size-4">
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </IconSvg>
  );
}

function RestockIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M3.29 7 12 12l8.71-5" />
      <path d="M12 22V12" />
      <path d="M19 16v6" />
      <path d="M22 19l-3 3-3-3" />
    </IconSvg>
  );
}
