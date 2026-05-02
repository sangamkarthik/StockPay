"use client";

import Image from "next/image";
import { useState } from "react";

type RecipeImage = {
  alt: string;
  src: string;
};

type RecipeImageCarouselProps = {
  images: RecipeImage[];
};

export function RecipeImageCarousel({ images }: RecipeImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <div className="relative h-[330px] overflow-hidden rounded-2xl bg-[#efe5d8] shadow-sm sm:h-[420px]">
      <Image
        alt={activeImage.alt}
        className="object-cover"
        fill
        priority
        sizes="(min-width: 1024px) 760px, 100vw"
        src={activeImage.src}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/5 to-transparent" />

      <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary shadow-sm">
        Easy
      </span>

      <button
        aria-label="Save recipe"
        className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition hover:bg-white"
        type="button"
      >
        <BookmarkIcon />
      </button>

      <button
        aria-label="Previous recipe image"
        className="absolute left-5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition hover:bg-white"
        onClick={showPrevious}
        type="button"
      >
        <ChevronLeftIcon />
      </button>
      <button
        aria-label="Next recipe image"
        className="absolute right-5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition hover:bg-white"
        onClick={showNext}
        type="button"
      >
        <ChevronRightIcon />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur">
        {images.map((image, index) => (
          <button
            aria-label={`Show image ${index + 1}: ${image.alt}`}
            className={`size-2.5 rounded-full transition ${
              activeIndex === index ? "w-7 bg-white" : "bg-white/55"
            }`}
            key={image.src}
            onClick={() => setActiveIndex(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
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

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
