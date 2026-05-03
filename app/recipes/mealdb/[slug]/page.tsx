import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { SaveRecipeButton } from "../../../components/save-recipe-button";
import { RecipeImageCarousel } from "../../../components/recipe-image-carousel";
import { RecipeIngredientsPanel, type RecipeIngredient } from "../../[id]/recipe-ingredients-panel";
import { prisma } from "../../../../lib/db/prisma";

type PageProps = { params: Promise<{ slug: string }> };

const MEAL_DB = "https://www.themealdb.com/api/json/v1/1";

type MealDetail = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strYoutube?: string;
  strSource?: string;
  strTags?: string;
  [key: string]: unknown;
};

function idFromSlug(slug: string) {
  const m = slug.match(/^(\d+)/);
  return m ? m[1] : null;
}

async function getMeal(slug: string): Promise<MealDetail | null> {
  const id = idFromSlug(slug);
  if (!id) return null;
  try {
    const res = await fetch(`${MEAL_DB}/lookup.php?i=${id}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json() as { meals?: MealDetail[] };
    return data.meals?.[0] ?? null;
  } catch {
    return null;
  }
}

function extractIngredients(meal: MealDetail): RecipeIngredient[] {
  const result: RecipeIngredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = String(meal[`strIngredient${i}`] ?? "").trim();
    const measure = String(meal[`strMeasure${i}`] ?? "").trim();
    if (name) result.push({ name, amount: measure || "As needed", price: 2.99 });
  }
  return result;
}

function parseSteps(raw: string): string[] {
  if (/STEP\s+\d/i.test(raw)) {
    return raw.split(/STEP\s+\d+\.?\s*/i).map(s => s.trim()).filter(Boolean);
  }
  const byParagraph = raw.split(/\r?\n\r?\n/).map(s => s.trim()).filter(Boolean);
  if (byParagraph.length > 1) return byParagraph;
  return raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meal = await getMeal(slug);
  if (!meal) return { title: "Recipe Not Found | Recipe Remix" };
  return {
    title: `${meal.strMeal} | Recipe Remix`,
    description: `${meal.strCategory} recipe from ${meal.strArea}. Cook it with ingredients you already have.`,
  };
}

export default async function MealDbRecipePage({ params }: PageProps) {
  const { slug } = await params;
  const meal = await getMeal(slug);
  if (!meal) notFound();

  const mealDbId = meal.idMeal;
  const existing = await prisma.savedRecipe.findUnique({ where: { mealDbId } }).catch(() => null);
  const isSaved = existing !== null;

  const ingredients = extractIngredients(meal);
  const steps = parseSteps(meal.strInstructions);
  const tags = meal.strTags ? meal.strTags.split(",").map(t => t.trim()).filter(Boolean) : [];

  const images = [{ src: meal.strMealThumb, alt: meal.strMeal }];

  const summaryStats = [
    { label: "Category", value: meal.strCategory, icon: <TagIcon /> },
    { label: "Cuisine", value: meal.strArea, icon: <GlobeIcon /> },
    { label: "Servings", value: "4", icon: <UsersIcon /> },
    { label: "Source", value: "TheMealDB", icon: <BookOpenIcon /> },
  ];

  const recipeMeta = [
    meal.strCategory,
    meal.strArea,
    `${ingredients.length} ingredients`,
    ...tags.slice(0, 2),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FEF9F5] text-primary">
      <RecipeNavbar />

      <main className="mx-auto grid w-full max-w-[1500px] gap-7 px-4 pb-12 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="min-w-0">
          <Link
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#625d52] transition hover:text-primary"
            href="/dashboard"
          >
            <ArrowLeftIcon />
            Back to recipes
          </Link>

          <article className="overflow-hidden rounded-3xl border border-[#eadfce] bg-white/85 p-4 shadow-sm shadow-[#8c6b3f]/5">
            <RecipeImageCarousel images={images} />

            <div className="px-1 py-6 sm:px-4">
              <h1 className="[font-family:var(--font-noto-serif)] text-4xl font-bold leading-tight text-[#2d2a25] sm:text-5xl">
                {meal.strMeal}
                <span className="ml-2 align-middle text-2xl">🌿</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625d52]">
                A {meal.strArea} {meal.strCategory.toLowerCase()} dish — cook it with ingredients you already have.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#625d52]">
                {recipeMeta.map((item, index) => (
                  <span className="inline-flex items-center gap-2" key={`${item}-${index}`}>
                    {item}
                    {index < recipeMeta.length - 1 && (
                      <span className="text-[#d8cdbc]">•</span>
                    )}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <SaveRecipeButton
                  mealDbId={mealDbId}
                  title={meal.strMeal}
                  slug={slug}
                  thumb={meal.strMealThumb}
                  category={meal.strCategory}
                  area={meal.strArea}
                  initialSaved={isSaved}
                />
                {meal.strYoutube && (
                  <a
                    href={meal.strYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/70 px-4 text-sm font-bold text-[#2d2a25] transition hover:bg-white"
                  >
                    <YoutubeIcon />
                    Watch on YouTube
                  </a>
                )}
                {meal.strSource && (
                  <a
                    href={meal.strSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/70 px-4 text-sm font-bold text-[#2d2a25] transition hover:bg-white"
                  >
                    <LinkIcon />
                    Original source
                  </a>
                )}
              </div>
            </div>
          </article>

          <section className="mt-7 rounded-3xl border border-[#eadfce] bg-white/85 p-5 shadow-sm shadow-[#8c6b3f]/5">
            <div className="flex border-b border-[#eadfce] text-sm font-bold text-[#625d52]">
              <button className="border-b-2 border-primary px-4 pb-4 text-primary" type="button">
                Directions
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {steps.map((step, index) => (
                <DirectionStep key={index} number={index + 1} text={step} />
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-7 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-3xl border border-[#eadfce] bg-white/85 p-5 shadow-sm shadow-[#8c6b3f]/5">
            <div className="divide-y divide-[#eadfce]">
              {summaryStats.map((stat) => (
                <div
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  key={stat.label}
                >
                  <span className="inline-flex items-center gap-3 text-sm font-bold text-[#625d52]">
                    <span className="text-primary">{stat.icon}</span>
                    {stat.label}
                  </span>
                  <span className="text-sm font-bold text-[#2d2a25]">{stat.value}</span>
                </div>
              ))}
            </div>
          </section>

          <RecipeIngredientsPanel ingredients={ingredients} />
        </aside>
      </main>
    </div>
  );
}

function DirectionStep({ number, text }: { number: number; text: string }) {
  return (
    <article className="flex gap-4 rounded-2xl p-1">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
        {number}
      </span>
      <p className="text-sm leading-7 text-[#625d52]">{text}</p>
    </article>
  );
}

function RecipeNavbar() {
  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/pantry", label: "Pantry" },
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

      <nav className="hidden flex-1 items-center gap-2 md:flex">
        {links.map((link) => (
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-[#2d2a25] transition hover:bg-white/70"
            href={link.href}
            key={link.label}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function IconSvg({ children, className = "size-4" }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function ArrowLeftIcon() {
  return <IconSvg><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></IconSvg>;
}

function BookOpenIcon() {
  return <IconSvg><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" /></IconSvg>;
}

function GlobeIcon() {
  return <IconSvg className="size-5"><circle cx="12" cy="12" r="10" /><path d="M12 2a15 15 0 0 1 0 20" /><path d="M12 2a15 15 0 0 0 0 20" /><path d="M2 12h20" /></IconSvg>;
}

function LinkIcon() {
  return <IconSvg><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></IconSvg>;
}

function TagIcon() {
  return <IconSvg className="size-5"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 17 10 5 10-5" /><path d="m2 12 10 5 10-5" /></IconSvg>;
}

function UsersIcon() {
  return <IconSvg className="size-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></IconSvg>;
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.7 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}
