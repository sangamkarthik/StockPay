import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { prisma } from "../../../lib/db/prisma";
import { RecipeImageCarousel } from "../../components/recipe-image-carousel";
import {
  RecipeIngredientsPanel,
  type RecipeIngredient,
} from "./recipe-ingredients-panel";

type RecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const fallbackRecipeImages = [
  {
    alt: "Recipe dish",
    src: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=85",
  },
  {
    alt: "Fresh ingredients",
    src: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    alt: "Recipe ingredients",
    src: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=85",
  },
];

const directions = [
  {
    title: "Bring a large pot of salted water to a boil.",
    body: "Add spaghetti and cook according to package instructions until al dente.",
    image:
      "https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "While the pasta cooks, heat olive oil in a large skillet.",
    body: "Add minced garlic and saute for 1-2 minutes until fragrant.",
    image:
      "https://images.unsplash.com/photo-1608755728617-aefab37d2edd?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Add cherry tomatoes and cook for 3-4 minutes.",
    body: "Let them soften and release their juices before adding the sauce.",
    image:
      "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Pour in heavy cream and stir.",
    body: "Bring to a gentle simmer, then add parmesan cheese. Stir until smooth and creamy.",
    image:
      "https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Add cooked pasta and spinach to the skillet.",
    body: "Toss everything together until the spinach wilts and the pasta is well coated.",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Season with salt and black pepper to taste.",
    body: "Serve hot with extra parmesan and enjoy.",
    image:
      "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=420&q=80",
  },
];

const recommendations = [
  {
    title: "Lemon Butter Pasta",
    time: "20 min",
    rating: "4.7 (98)",
    image:
      "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=220&q=80",
  },
  {
    title: "Tuscan Chicken Pasta",
    time: "30 min",
    rating: "4.6 (86)",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=220&q=80",
  },
  {
    title: "Creamy Mushroom Pasta",
    time: "25 min",
    rating: "4.5 (72)",
    image:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=220&q=80",
  },
];

async function getRecipe(id: string) {
  const recipeId = Number(id);

  if (!Number.isInteger(recipeId)) {
    return null;
  }

  return prisma.recipe.findUnique({
    include: {
      recipeIngredients: {
        include: {
          ingredient: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    where: {
      id: recipeId,
    },
  });
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return {
      title: "Recipe Not Found | Recipe Remix",
    };
  }

  return {
    description:
      recipe.description ??
      "A pantry-aware recipe with ingredients and step-by-step directions.",
    title: `${recipe.title} | Recipe Remix`,
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const recipeImages = getRecipeImages(recipe);
  const summaryStats = [
    { label: "Prep Time", value: recipe.prepTime ?? "10 min", icon: <ClockIcon /> },
    { label: "Cook Time", value: recipe.cookTime ?? "15 min", icon: <TimerIcon /> },
    {
      label: "Total Time",
      value: recipe.totalTime ?? recipe.cookTime ?? "25 min",
      icon: <ClockIcon />,
    },
    {
      label: "Servings",
      value: String(recipe.servings ?? 4),
      icon: <UsersIcon />,
    },
  ];
  const recipeMeta = [
    `${formatRating(recipe.rating)} (${recipe.reviews})`,
    recipe.totalTime ?? recipe.cookTime ?? "25 min",
    `${recipe.servings ?? 4} Servings`,
    recipe.difficulty ?? "Easy",
    ...recipe.tags.slice(0, 2),
  ];
  type RawRecipeIngredient = {
    displayQuantity: string | null;
    amount: string | null;
    unit: string | null;
    ingredient: { name: string; price: unknown };
  };
  const recipeIngredients: RecipeIngredient[] = recipe.recipeIngredients.map(
    (recipeIngredient: RawRecipeIngredient) => ({
      amount:
        recipeIngredient.displayQuantity ||
        [recipeIngredient.amount, recipeIngredient.unit].filter(Boolean).join(" ") ||
        "As needed",
      name: recipeIngredient.ingredient.name,
      price: Number(recipeIngredient.ingredient.price ?? 0),
    }),
  );

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
            <RecipeImageCarousel images={recipeImages} />

            <div className="px-1 py-6 sm:px-4">
              <h1 className="[font-family:var(--font-noto-serif)] text-4xl font-bold leading-tight text-[#2d2a25] sm:text-5xl">
                {recipe.title}
                <span className="ml-2 align-middle text-2xl">🌿</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625d52]">
                {recipe.description ??
                  "A pantry-aware recipe ready to remix with what you have on hand."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#625d52]">
                {recipeMeta.map((item, index) => (
                  <span
                    className="inline-flex items-center gap-2"
                    key={`${item}-${index}`}
                  >
                    {index === 0 && (
                      <span className="font-bold text-[#e3a217]">★</span>
                    )}
                    {item}
                    {index < recipeMeta.length - 1 && (
                      <span className="text-[#d8cdbc]">•</span>
                    )}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <ActionButton
                  icon={<HeartIcon />}
                  label="Like"
                  value={String(recipe.likes)}
                />
                <ActionButton
                  icon={<BookmarkIcon />}
                  label="Save"
                  value={String(recipe.saves)}
                />
                <ActionButton icon={<ShareIcon />} label="Share" />
                <ActionButton icon={<CollectionIcon />} label="Add to collection" />
              </div>
            </div>
          </article>

          <section className="mt-7 rounded-3xl border border-[#eadfce] bg-white/85 p-5 shadow-sm shadow-[#8c6b3f]/5">
            <div className="flex border-b border-[#eadfce] text-sm font-bold text-[#625d52]">
              <button
                className="border-b-2 border-primary px-4 pb-4 text-primary"
                type="button"
              >
                Directions
              </button>
              <button className="px-4 pb-4" type="button">
                Notes (12)
              </button>
              <button className="px-4 pb-4" type="button">
                Reviews (126)
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {directions.map((step, index) => (
                <DirectionStep key={step.title} number={index + 1} {...step} />
              ))}
            </div>

            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/70 text-sm font-bold text-[#2d2a25] transition hover:bg-white"
              type="button"
            >
              <PlusIcon />
              Add a note
            </button>
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
                  {stat.label === "Servings" ? (
                    <ServingStepper />
                  ) : (
                    <span className="text-sm font-bold text-[#2d2a25]">
                      {stat.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <RecipeIngredientsPanel ingredients={recipeIngredients} />

          <section className="rounded-3xl border border-[#eadfce] bg-white/85 p-5 shadow-sm shadow-[#8c6b3f]/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2d2a25]">
                You might also like
              </h2>
              <a className="text-xs font-bold text-primary" href="#">
                View all
              </a>
            </div>

            <div className="space-y-4">
              {recommendations.map((recipe) => (
                <RecommendationCard key={recipe.title} {...recipe} />
              ))}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}

type RecipeWithIngredients = NonNullable<Awaited<ReturnType<typeof getRecipe>>>;

function formatRating(rating: RecipeWithIngredients["rating"]) {
  return rating ? Number(rating).toFixed(1) : "4.8";
}

function getRecipeImages(recipe: RecipeWithIngredients) {
  const imageUrls = recipe.imageUrls.length
    ? recipe.imageUrls
    : recipe.imageUrl
      ? [recipe.imageUrl]
      : [];

  if (!imageUrls.length) {
    return fallbackRecipeImages;
  }

  return (imageUrls as string[]).map((src, index) => ({
    alt: `${recipe.title} image ${index + 1}`,
    src,
  }));
}

function RecipeNavbar() {
  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/recipes/1", label: "Recipes" },
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

      <nav className="hidden flex-1 items-center gap-2 md:flex">
        {links.map((link) => (
          <Link
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              link.label === "Recipes"
                ? "bg-[#f1ede5] text-primary"
                : "text-[#2d2a25] hover:bg-white/70"
            }`}
            href={link.href}
            key={link.label}
          >
            {link.label === "Home" && <HomeIcon />}
            {link.label === "Recipes" && <BookOpenIcon />}
            {link.label === "Pantry" && <JarIcon />}
            {link.label === "Community" && <HeartIcon />}
            {link.label === "Shop" && <SparkleIcon />}
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
        <span className="relative size-10 overflow-hidden rounded-full bg-[#e9d8c2]">
          <Image
            alt="Sarah avatar"
            className="object-cover"
            fill
            sizes="40px"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
          />
        </span>
        <ChevronDownIcon />
      </button>
    </header>
  );
}

function ActionButton({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <button
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/70 px-4 text-sm font-bold text-[#2d2a25] transition hover:bg-white"
      type="button"
    >
      {icon}
      {label}
      {value && <span className="text-[#625d52]">{value}</span>}
    </button>
  );
}

function DirectionStep({
  body,
  image,
  number,
  title,
}: {
  body: string;
  image: string;
  number: number;
  title: string;
}) {
  return (
    <article className="grid gap-4 rounded-2xl p-1 sm:grid-cols-[1fr_180px] sm:items-center">
      <div className="flex gap-4">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-white">
          {number}
        </span>
        <div>
          <h3 className="text-sm font-bold leading-6 text-[#2d2a25]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-[#625d52]">{body}</p>
        </div>
      </div>
      <div className="relative h-28 overflow-hidden rounded-2xl sm:h-24">
        <Image
          alt={title}
          className="object-cover"
          fill
          sizes="180px"
          src={image}
        />
      </div>
    </article>
  );
}

function ServingStepper({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`inline-flex items-center rounded-xl border border-[#ddd3c5] bg-white/80 text-[#2d2a25] ${
        compact ? "h-9" : "h-10"
      }`}
    >
      <button
        aria-label="Decrease servings"
        className="grid size-9 place-items-center text-lg font-bold"
        type="button"
      >
        -
      </button>
      <span className="min-w-8 text-center text-sm font-bold">4</span>
      <button
        aria-label="Increase servings"
        className="grid size-9 place-items-center text-lg font-bold"
        type="button"
      >
        +
      </button>
    </div>
  );
}

function RecommendationCard({
  image,
  rating,
  time,
  title,
}: (typeof recommendations)[number]) {
  return (
    <article className="flex items-center gap-3">
      <div className="relative size-16 overflow-hidden rounded-2xl">
        <Image alt={title} className="object-cover" fill sizes="64px" src={image} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-bold text-[#2d2a25]">{title}</h3>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#625d52]">
          <span>{time}</span>
          <span className="font-bold text-[#e3a217]">★ {rating}</span>
        </p>
      </div>
      <button
        aria-label={`Save ${title}`}
        className="grid size-9 place-items-center rounded-xl text-primary"
        type="button"
      >
        <BookmarkIcon />
      </button>
    </article>
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

function ArrowLeftIcon() {
  return (
    <IconSvg>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </IconSvg>
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

function BookmarkIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M6 4h12v17l-6-4-6 4V4Z" />
    </IconSvg>
  );
}

function BookOpenIcon() {
  return (
    <IconSvg>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
    </IconSvg>
  );
}

function ChevronDownIcon() {
  return (
    <IconSvg>
      <path d="m6 9 6 6 6-6" />
    </IconSvg>
  );
}

function ClockIcon() {
  return (
    <IconSvg className="size-5">
      <path d="M12 8v5l3 2" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </IconSvg>
  );
}

function CollectionIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </IconSvg>
  );
}

function HeartIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </IconSvg>
  );
}

function HomeIcon() {
  return (
    <IconSvg>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </IconSvg>
  );
}

function JarIcon() {
  return (
    <IconSvg>
      <path d="M8 4h8l1 3H7l1-3Z" />
      <path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Z" />
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

function ShareIcon() {
  return (
    <IconSvg className="size-4">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M16 6 12 2 8 6" />
      <path d="M12 2v13" />
    </IconSvg>
  );
}

function SparkleIcon() {
  return (
    <IconSvg>
      <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z" />
      <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
    </IconSvg>
  );
}

function TimerIcon() {
  return (
    <IconSvg className="size-5">
      <path d="M10 2h4" />
      <path d="M12 14v-4" />
      <path d="M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    </IconSvg>
  );
}

function UsersIcon() {
  return (
    <IconSvg className="size-5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </IconSvg>
  );
}
