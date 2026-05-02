import Image from "next/image";

type CreatorCardProps = {
  image: string;
  title: string;
  handle: string;
  likes: number;
  avatar: string;
};

export function CreatorCard({
  image,
  title,
  handle,
  likes,
  avatar,
}: CreatorCardProps) {
  return (
    <article className="relative min-h-52 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 220px, 70vw"
      />
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ead8c4] text-xs font-bold text-primary">
            {avatar}
          </span>
          <span className="truncate text-xs font-bold text-[#2d2a25]">
            {handle}
          </span>
        </div>
        <span className="shrink-0 text-xs font-bold text-[#df6040]">
          Like {likes}
        </span>
      </div>
    </article>
  );
}
