import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/button";

const steps = [
  {
    number: "1",
    title: "Add your ingredients",
    description: "Manually add or scan your pantry to see what you have.",
    image: "/illustrations/citrus-oil-basil.png",
    alt: "Illustration of pantry ingredients with oil, basil, and a jar",
    href: "/pantry",
  },
  {
    number: "2",
    title: "Get recipe ideas",
    description: "We'll suggest recipes you can make with what's on hand.",
    image: "/illustrations/recipe-card.png",
    alt: "Illustration of recipe cards with pasta ideas",
    href: "/dashboard",
  },
  {
    number: "3",
    title: "Cook & enjoy",
    description: "Follow easy steps, shop missing items, and enjoy.",
    image: "/illustrations/grocery-basket.png",
    alt: "Illustration of a grocery basket with ingredients",
    href: "/recipes/1",
  },
];

export function HowItWorks() {
  return (
    <section className="px-2 pb-20 pt-16 lg:pb-24 lg:pt-20">
      <div className="mx-auto max-w-[1500px] text-center">
        <p className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
          How it works
        </p>
        <h2 className="[font-family:var(--font-noto-serif)] text-3xl font-bold tracking-tight text-[#2d2a25] sm:text-4xl">
          Dinner, your way in 3 simple steps
        </h2>

        <div id="how-it-works" className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <Link
              href={step.href}
              className="group relative flex flex-col items-center transition hover:opacity-90"
              key={step.title}
            >
              {index > 0 ? (
                <div className="absolute right-[calc(50%+5.5rem)] top-16 hidden w-[38%] items-center md:flex">
                  <span className="h-px flex-1 border-t border-dashed border-[#9ca68c]" />
                  <span className="size-2 rotate-45 border-r border-t border-[#9ca68c]" />
                </div>
              ) : null}

              <div className="relative mx-auto grid size-28 place-items-center">
                <span className="absolute -left-9 -top-4 grid size-9 place-items-center rounded-full bg-[#d8e4c3] text-base font-bold text-primary">
                  {step.number}
                </span>
                <div className="absolute inset-1 rounded-3xl bg-[#EFEEE2] transition group-hover:bg-[#e5e4d6]" />
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-contain"
                  sizes="112px"
                />
              </div>

              <h3 className="mt-3 text-lg font-bold text-[#2d2a25] group-hover:text-primary">
                {step.title}
              </h3>
              <p className="mt-2 max-w-56 text-sm leading-6 text-[#403d36]">
                {step.description}
              </p>
              <span className="mt-2 text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">
                Try it →
              </span>
            </Link>
          ))}
        </div>

        <Button className="mt-12" href="/dashboard" size="lg">
          Get started free
        </Button>
      </div>
    </section>
  );
}
