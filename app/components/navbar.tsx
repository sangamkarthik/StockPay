import Link from "next/link";
import { Button } from "./button";

const navLinks = [
  { label: "Features", href: "/#how-it-works" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Pantry", href: "/pantry" },
  { label: "Recipes", href: "/dashboard" },
  { label: "Community", href: "#" },
];

export function Navbar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1500px] items-center justify-between px-2 py-6">
      <Link className="font-serif text-3xl font-bold leading-none" href="/">
        <span className="block text-primary">recipe</span>
        <span className="-mt-2 block text-[#de6040]">remix</span>
      </Link>

      <nav className="hidden items-center gap-9 text-sm font-medium text-[#2d2a25] md:flex">
        {navLinks.map(({ label, href }) => (
          <Link href={href} key={label} className="transition hover:text-primary">
            {label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <Button href="/login" size="sm" variant="secondary">
          Log in
        </Button>
        <Button href="/dashboard" size="sm">
          Sign up free
        </Button>
      </div>
    </header>
  );
}
