import type { ReactNode } from "react";

type RecipeCarouselProps = {
  title: string;
  actionLabel?: string;
  children: ReactNode;
};

export function RecipeCarousel({
  title,
  actionLabel = "View all recipes",
  children,
}: RecipeCarouselProps) {
  return (
    <section className="rounded-3xl border border-[#eadfce] bg-white/80 p-5 shadow-sm shadow-[#8c6b3f]/5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="[font-family:var(--font-noto-serif)] text-2xl font-bold text-[#2d2a25]">
          {title}
        </h2>
        <a
          className="hidden items-center gap-2 text-sm font-bold text-primary hover:text-[#df6040] sm:inline-flex"
          href="#"
        >
          {actionLabel}
          <ArrowRightIcon />
        </a>
      </div>

      <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
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
