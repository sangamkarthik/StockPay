import { Button } from "../components/button";

export function FinalCtaSection() {
  return (
    <section className="px-2 pb-12">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-6 rounded-2xl bg-[#f0f0e4] px-8 py-7 text-center sm:flex-row sm:justify-between sm:text-left lg:px-24">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <WhiskIcon />
          <div>
            <h2 className="text-xl font-bold text-primary">
              Ready to remix your cooking?
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#403d36]">
              Create your free account and start cooking smarter today.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <Button href="#">
            Get started free
          </Button>
          <ArrowAccent />
        </div>
      </div>
    </section>
  );
}

function WhiskIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-14 w-12 shrink-0"
      fill="none"
      viewBox="0 0 48 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 11c5 5 10 14 11 23"
        stroke="#385026"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M7 8c12 5 18 16 20 27"
        stroke="#385026"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M24 6c4 7 6 16 5 28"
        stroke="#385026"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M28 35 38 49"
        stroke="#df6040"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M32 5 35 1"
        stroke="#df6040"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M38 13h5"
        stroke="#df6040"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M39 7 43 4"
        stroke="#df6040"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ArrowAccent() {
  return (
    <svg
      aria-hidden="true"
      className="hidden h-12 w-16 shrink-0 text-primary md:block"
      fill="none"
      viewBox="0 0 64 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M52 13c-8 14-22 22-41 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M15 26 10 33l8 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
