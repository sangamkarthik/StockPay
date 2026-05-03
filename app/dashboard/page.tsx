import Image from "next/image";
import Link from "next/link";
import { prisma } from "../../lib/db/prisma";
import { PantryOverview } from "../components/pantry-overview";
import {
  RecipeCard,
  type PantryStatus,
  type RecipeCardProps,
} from "../components/recipe-card";
import { RecipeCarousel } from "../components/recipe-carousel";
import { RecipeSuggestions } from "../components/recipe-suggestions";
import { SavedRecipesSection } from "../components/saved-recipes-section";

const pantryItems = [
  {
    label: "Have all",
    count: 22,
    description: "Ready to cook",
    tone: "green" as const,
  },
  {
    label: "Have some",
    count: 6,
    description: "Almost there",
    tone: "gold" as const,
  },
  {
    label: "Missing",
    count: 7,
    description: "Add to list",
    tone: "red" as const,
  },
];

async function getRecipeIdeas(): Promise<RecipeCardProps[]> {
  const recipes = await prisma.recipe.findMany({
    orderBy: [{ rating: "desc" }, { reviews: "desc" }, { createdAt: "desc" }],
    select: {
      cookTime: true,
      id: true,
      imageUrl: true,
      imageUrls: true,
      rating: true,
      recipeIngredients: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          pantryStatus: true,
        },
      },
      reviews: true,
      tags: true,
      title: true,
      totalTime: true,
    },
    take: 8,
  });

  return recipes.map((recipe) => ({
    cookTime: recipe.totalTime ?? recipe.cookTime ?? "25 min",
    href: `/recipes/${recipe.id}`,
    image: recipe.imageUrl ?? recipe.imageUrls[0] ?? "/images/pasta-thumb.png",
    pantryStatus: getPantryStatuses(recipe.recipeIngredients),
    rating: recipe.rating ? Number(recipe.rating).toFixed(1) : "4.8",
    reviews: recipe.reviews,
    tags: recipe.tags.slice(0, 2),
    title: recipe.title,
  }));
}

function getPantryStatuses(
  recipeIngredients: { pantryStatus: string }[],
): PantryStatus[] {
  const statusMap: Record<string, PantryStatus> = {
    HAVE_ALL: "haveAll",
    HAVE_SOME: "haveSome",
    MISSING: "missing",
  };
  const statuses = recipeIngredients
    .map(({ pantryStatus }) => statusMap[pantryStatus])
    .filter((status): status is PantryStatus => Boolean(status));

  return Array.from(new Set(statuses)).slice(0, 3);
}

export default async function DashboardPage() {
  const recipes = await getRecipeIdeas();

  return (
    <div className="min-h-screen bg-[#FEF9F5] text-primary">
      <DashboardNavbar />

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-12 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-4xl bg-[#fff6ee] px-5 py-10 shadow-sm shadow-[#8c6b3f]/5 lg:grid lg:min-h-[430px] lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:px-8">
          <div className="z-10 max-w-xl">
            <h1 className="[font-family:var(--font-noto-serif)] text-5xl font-bold leading-[1.02] tracking-tight text-primary sm:text-6xl lg:text-[68px]">
              What will you
              <span className="block">
                <span className="text-[#df6040]">cook</span> today?
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-[#403d36]">
              Find recipe ideas based on what you have in your pantry and your
              cravings.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary/90"
                href="#recipes"
              >
                <SparkleIcon />
                Find Recipe Ideas
              </a>
              <Link
                className="inline-flex h-14 items-center justify-center gap-3 rounded-xl border border-[#ddd3c5] bg-white/70 px-8 text-sm font-bold text-[#2d2a25] shadow-sm transition hover:bg-white"
                href="/pantry"
              >
                <ScanIcon />
                Scan Pantry
              </Link>
            </div>
          </div>

          <div className="relative mt-10 min-h-[360px] lg:mt-0">
            <div className="absolute inset-0 overflow-hidden rounded-4xl lg:rounded-none">
              <Image
                alt="Creamy pasta with cherry tomatoes and basil"
                className="object-cover object-center"
                fill
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
                src="/images/pasta-hero.png"
              />
              <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-[#fff6ee] to-transparent lg:block" />
              <div className="absolute inset-0 bg-linear-to-t from-[#fff6ee]/45 to-transparent lg:hidden" />
            </div>

            <div className="relative z-10 ml-auto max-w-xs pt-8 lg:mr-4">
              <PantryOverview items={pantryItems} />
            </div>
          </div>
        </section>

        <SavedRecipesSection />
        <RecipeSuggestions />

        <div className="mt-7" id="recipes">
          <RecipeCarousel title="Recipe ideas for you">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.title} {...recipe} />
            ))}
          </RecipeCarousel>
        </div>

        <section className="mt-7 rounded-3xl border border-[#eadfce] bg-white/80 p-5 shadow-sm shadow-[#8c6b3f]/5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="[font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
              Your ingredient highlights
            </h2>
            <Link
              className="hidden items-center gap-2 text-sm font-bold text-primary hover:text-[#df6040] sm:inline-flex"
              href="/pantry"
            >
              View all ingredients
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3" id="pantry">
            {pantryItems.map((item) => (
              <IngredientHighlight key={item.label} {...item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardNavbar() {
  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "#recipes", label: "Recipes" },
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
              link.label === "Home"
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
    </header>
  );
}

function IngredientHighlight({
  count,
  description,
  label,
  tone,
}: (typeof pantryItems)[number]) {
  const styles = {
    green: {
      bg: "bg-primary/8",
      iconBg: "bg-primary/10",
      text: "text-primary",
      icon: <LeafIcon />,
    },
    gold: {
      bg: "bg-[#d79a20]/8",
      iconBg: "bg-[#d79a20]/12",
      text: "text-[#d79a20]",
      icon: <BowlIcon />,
    },
    red: {
      bg: "bg-[#df6040]/8",
      iconBg: "bg-[#df6040]/10",
      text: "text-[#df6040]",
      icon: <BagIcon />,
    },
  }[tone];

  return (
    <article
      className={`flex min-h-28 items-center gap-4 rounded-2xl border border-[#eadfce] ${styles.bg} px-5 py-4`}
    >
      <span
        className={`grid size-14 place-items-center rounded-full ${styles.iconBg} ${styles.text}`}
      >
        {styles.icon}
      </span>
      <div>
        <p className={`text-2xl font-bold leading-none ${styles.text}`}>
          {count}
        </p>
        <h3 className="mt-1 text-sm font-bold text-[#2d2a25]">
          You {label.toLowerCase()}
        </h3>
        <p className="mt-1 text-xs text-[#625d52]">{description}</p>
      </div>
    </article>
  );
}

function SparkleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      <path d="m5 14 .8 1.8L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-1.2L5 14Z" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M7 3H5a2 2 0 0 0-2 2v2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M17 21h2a2 2 0 0 0 2-2v-2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M20 4c-7.5 0-12 4.5-12 10a6 6 0 0 0 6 6c5.5 0 8-6 6-16Z" />
      <path d="M4 20c3-6 7-9 12-10" />
    </svg>
  );
}

function BowlIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 11h16l-1.4 5.2A4 4 0 0 1 14.7 19H9.3a4 4 0 0 1-3.9-2.8L4 11Z" />
      <path d="M7 11 5.5 7.5" />
      <path d="M17 11l1.5-3.5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}
