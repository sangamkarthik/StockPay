import { Button } from "../components/button";
import { CreatorCard } from "../components/creator-cards";

const creatorCards = [
  {
    image: "/images/pasta-thumb.png",
    title: "Tomato basil salad bowl",
    handle: "@kitchenmagic",
    likes: 128,
    avatar: "K",
  },
  {
    image: "/images/pasta-hero.png",
    title: "Fresh baked muffins",
    handle: "@bakewithsam",
    likes: 98,
    avatar: "B",
  },
  {
    image: "/images/pasta-thumb.png",
    title: "Chickpea cucumber salad",
    handle: "@fresh.bites",
    likes: 76,
    avatar: "F",
  },
  {
    image: "/images/pasta-hero.png",
    title: "Cozy soup bowl",
    handle: "@souppergood",
    likes: 112,
    avatar: "S",
  },
];

export function CommunitySection() {
  return (
    <section className="px-2 pb-20">
      <div className="mx-auto grid max-w-[1500px] overflow-hidden rounded-3xl bg-[#fff6ed] shadow-sm md:grid-cols-[0.9fr_1.6fr]">
        <div className="flex flex-col justify-center px-8 py-10 md:px-12">
          <h2 className="[font-family:var(--font-noto-serif)] text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl">
            Join a community of <span className="text-[#df6040]">creators</span>{" "}
            and food lovers
          </h2>
          <p className="mt-4 max-w-sm text-base leading-7 text-[#403d36]">
            Share your remixes, discover new favorites, and get inspired every
            day.
          </p>
          <Button className="mt-6 w-fit" href="/dashboard" size="sm" variant="outline">
            Explore community
          </Button>
        </div>

        <div className="grid gap-3 px-4 pb-4 md:grid-cols-4 md:px-4 md:py-4">
          {creatorCards.map((card) => (
            <CreatorCard {...card} key={card.handle} />
          ))}
        </div>
      </div>
    </section>
  );
}
