import Image from "next/image";
import { Button } from "../components/button";
import { Navbar } from "../components/navbar";

export function HeroSection() {
  return (
    <>
      <Navbar />

      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[62%] lg:block">
          <Image
            src="/images/pasta-hero.png"
            alt="Creamy pasta with cherry tomatoes and basil"
            fill
            priority
            className="object-cover object-center"
            sizes="62vw"
          />
          <div className="absolute inset-y-0 left-0 w-[38%] bg-linear-to-r from-[#FEF9F5] via-[#FEF9F5]/45 to-transparent" />
        </div>

        <section className="mx-auto grid min-h-[650px] w-full max-w-[1500px] items-center px-2 pb-14 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:pb-20 lg:pt-20">
          <div className="max-w-xl">
            <h1 className="[font-family:var(--font-noto-serif)] text-5xl font-bold leading-[1.02] tracking-tight text-primary sm:text-6xl lg:text-[68px]">
              Remix recipes.
              <span className="block text-[#df6040] sm:whitespace-nowrap">
                Love what&apos;s next.
              </span>
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-[#403d36]">
              Turn what you have into something delicious. Smart ingredient
              tracking, easy recipe remixes, and endless inspiration.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button href="#" size="lg">
                Get started free
              </Button>
              <Button className="gap-3 px-3" href="#" size="lg" variant="ghost">
                <span className="grid size-11 place-items-center rounded-full border border-[#bfc7b4] bg-white/60">
                  <span className="ml-1 size-0 border-y-[7px] border-l-11 border-y-transparent border-l-primary" />
                </span>
                Watch how it works
              </Button>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["A", "M", "J", "S"].map((initial) => (
                  <span
                    className="grid size-10 place-items-center rounded-full border-2 border-[#FEF9F5] bg-[#e8d7c1] text-sm font-bold text-primary"
                    key={initial}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <p className="max-w-44 text-sm leading-5 text-[#625d52]">
                <span className="block font-semibold text-[#e3a217]">
                  5.0 rating
                </span>
                Join 50,000+ home cooks cooking smarter
              </p>
            </div>
          </div>

          <div className="relative mt-12 min-h-[420px] overflow-hidden rounded-4xl lg:mt-0 lg:hidden">
            <Image
              src="/images/pasta-hero.png"
              alt="Creamy pasta with cherry tomatoes and basil"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#FEF9F5] via-[#FEF9F5]/15 to-transparent" />
          </div>
        </section>
      </main>
    </>
  );
}
