import Image from "next/image";
import Link from "next/link";

export type PantryStatus = "haveAll" | "haveSome" | "missing";

export type RecipeCardProps = {
  title: string;
  image: string;
  cookTime: string;
  rating: string;
  reviews: number;
  tags: string[];
  pantryStatus: PantryStatus[];
  href?: string;
};

const pantryStyles: Record<PantryStatus, string> = {
  haveAll: "bg-primary/10 text-primary",
  haveSome: "bg-[#d79a20]/12 text-[#d79a20]",
  missing: "bg-[#df6040]/10 text-[#df6040]",
};

export function RecipeCard({
  href,
  title,
  image,
  cookTime,
  rating,
  reviews,
  tags,
  pantryStatus,
}: RecipeCardProps) {
  const card = (
    <article className="group min-w-[260px] overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm shadow-[#8c6b3f]/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8c6b3f]/10">
      <div className="relative h-40 overflow-hidden">
        <Image
          alt={title}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(min-width: 1024px) 280px, 80vw"
          src={image}
        />
        <button
          aria-label={`Save ${title}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur"
          type="button"
        >
          <BookmarkIcon />
        </button>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          <ClockIcon />
          {cookTime}
        </span>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-[#2d2a25]">
          {href ? (
            <Link className="hover:text-primary" href={href}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#625d52]">
          <span className="font-bold text-[#e3a217]">★ {rating}</span>
          <span>({reviews})</span>
          {tags.map((tag, index) => (
            <span
              className="rounded-full bg-[#f7f0e7] px-2 py-1 text-[#625d52]"
              key={`${tag}-${index}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          {pantryStatus.map((status, index) => (
            <span
              aria-label={status}
              className={`grid size-8 place-items-center rounded-full ${pantryStyles[status]}`}
              key={`${status}-${index}`}
            >
              {status === "haveAll" ? (
                <LeafIcon />
              ) : status === "haveSome" ? (
                <BowlIcon />
              ) : (
                <BagIcon />
              )}
            </span>
          ))}
        </div>
      </div>
    </article>
  );

  return card;
}

function BookmarkIcon() {
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
      <path d="M6 4h12v17l-6-4-6 4V4Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 8v5l3 2" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    </svg>
  );
}

function LeafIcon() {
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
      <path d="M20 4c-7.5 0-12 4.5-12 10a6 6 0 0 0 6 6c5.5 0 8-6 6-16Z" />
      <path d="M4 20c3-6 7-9 12-10" />
    </svg>
  );
}

function BowlIcon() {
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
      className="size-4"
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
