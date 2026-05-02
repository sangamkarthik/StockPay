import { Button } from "./button";

const navLinks = ["Features", "Pricing", "Community", "Blog", "About"];

export function Navbar() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-[1500px] items-center justify-between px-2 py-6">
      <a className="font-serif text-3xl font-bold leading-none" href="#">
        <span className="block text-primary">recipe</span>
        <span className="-mt-2 block text-[#de6040]">remix</span>
      </a>

      <nav className="hidden items-center gap-9 text-sm font-medium text-[#2d2a25] md:flex">
        {navLinks.map((label) => (
          <a href="#" key={label}>
            {label}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <Button href="#" size="sm" variant="secondary">
          Log in
        </Button>
        <Button href="#" size="sm">
          Sign up free
        </Button>
      </div>
    </header>
  );
}
