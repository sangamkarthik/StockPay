const infoItems = [
  {
    title: "Smart Pantry",
    description: "Track ingredients and know exactly what you have.",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: PantryIcon,
    href: "/pantry",
  },
  {
    title: "Recipe Remix",
    description: "Get recipe ideas based on your ingredients and preferences.",
    color: "text-[#df6040]",
    bg: "bg-[#df6040]/10",
    icon: BowlIcon,
    href: "/dashboard",
  },
  {
    title: "Shop Smarter",
    description: "Buy only what you need with smart grocery lists.",
    color: "text-[#d79a20]",
    bg: "bg-[#d79a20]/12",
    icon: BasketIcon,
    href: "/recipes/1",
  },
  {
    title: "Save & Share",
    description: "Save your favorites and share your creations.",
    color: "text-[#c74a4a]",
    bg: "bg-[#c74a4a]/10",
    icon: HeartIcon,
    href: "/dashboard",
  },
];

export function InfoBar() {
  return (
    <section className="relative z-10 mx-auto -mt-10 w-full max-w-[1500px] px-2 lg:-mt-14">
      <div className="grid overflow-hidden rounded-2xl border border-[#eadfce] bg-white/95 shadow-md shadow-[#8c6b3f]/5 backdrop-blur md:grid-cols-4">
        {infoItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <a
              href={item.href}
              className="group relative flex min-h-36 flex-col items-center justify-center px-8 py-7 text-center transition hover:bg-[#faf8f5]"
              key={item.title}
            >
              {index > 0 ? (
                <span className="absolute left-0 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-[#eadfce] md:block" />
              ) : null}
              <span
                className={`mb-4 grid size-14 place-items-center rounded-full ${item.bg} ${item.color} transition group-hover:scale-110`}
              >
                <Icon />
              </span>
              <h2 className={`text-base font-bold ${item.color}`}>
                {item.title}
              </h2>
              <p className="mt-2 max-w-48 text-sm leading-5 text-[#403d36]">
                {item.description}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function PantryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M8 4h8l1 3H7l1-3Z" />
      <path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7Z" />
      <path d="M9.5 12.5 12 15l3.5-4" />
    </svg>
  );
}

function BowlIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M4 11h16l-1.4 5.2A4 4 0 0 1 14.7 19H9.3a4 4 0 0 1-3.9-2.8L4 11Z" />
      <path d="M7 11 5.5 7.5" />
      <path d="M17 11l1.5-3.5" />
      <path d="M9 7c1.5-1 3.5-1 5 0" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M5 10h14l-1.3 9H6.3L5 10Z" />
      <path d="M9 10 12 5l3 5" />
      <path d="M9 14v2" />
      <path d="M15 14v2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M20.4 6.7a5 5 0 0 0-7.1 0L12 8l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 22l8.4-8.2a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}
