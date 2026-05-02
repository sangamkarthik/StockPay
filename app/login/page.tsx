import Image from "next/image";
import Link from "next/link";

const socialButtons = [
  {
    label: "Continue with Google",
    icon: <GoogleIcon />,
  },
  {
    label: "Continue with Apple",
    icon: <AppleIcon />,
  },
  {
    label: "Continue with Facebook",
    icon: <FacebookIcon />,
  },
];

const featureTiles = [
  {
    title: "Smart Pantry",
    description: "Track and manage your ingredients",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: <LeafIcon />,
  },
  {
    title: "Recipe Remix",
    description: "Get recipe ideas based on what you have",
    color: "text-[#df6040]",
    bg: "bg-[#df6040]/10",
    icon: <BowlIcon />,
  },
  {
    title: "Save & Share",
    description: "Save favorites and share your creations",
    color: "text-[#d79a20]",
    bg: "bg-[#d79a20]/12",
    icon: <HeartIcon />,
  },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FEF9F5] text-[#2d2a25]">
      <main className="mx-auto grid min-h-screen w-full max-w-[1500px] gap-8 px-4 py-5 lg:grid-cols-[0.95fr_1.05fr] lg:px-7">
        <section className="flex items-center justify-center">
          <div className="w-full max-w-[610px] rounded-4xl border border-[#eadfce] bg-white/90 px-6 py-8 shadow-2xl shadow-[#8c6b3f]/10 backdrop-blur sm:px-10 sm:py-12 lg:px-14">
            <Link className="inline-block leading-none" href="/">
              <span className="block [font-family:var(--font-noto-serif)] text-4xl font-bold tracking-tight text-primary">
                recipe
              </span>
              <span className="-mt-2 block text-4xl font-bold italic tracking-tight text-[#df6040]">
                remix
              </span>
            </Link>

            <div className="mt-14">
              <p className="text-sm font-medium text-[#df6040]">Welcome back</p>
              <h1 className="mt-2 [font-family:var(--font-noto-serif)] text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
                Log in to remix delicious recipes.
              </h1>
              <p className="mt-3 text-base leading-7 text-[#625d52]">
                Pick up where you left off with smart pantry ideas, saved
                favorites, and fresh recipe remixes.
              </p>
            </div>

            <div className="mt-8 grid gap-3">
              {socialButtons.map((button) => (
                <a
                  className="flex h-14 items-center justify-center gap-4 rounded-xl border border-[#ddd3c5] bg-white px-5 text-sm font-bold text-[#2d2a25] shadow-sm shadow-[#8c6b3f]/5 transition hover:border-primary/30 hover:bg-[#fffaf4]"
                  href="#"
                  key={button.label}
                >
                  <span className="grid size-6 place-items-center">
                    {button.icon}
                  </span>
                  {button.label}
                </a>
              ))}
            </div>

            <div className="my-7 flex items-center gap-4 text-sm text-[#8f887c]">
              <span className="h-px flex-1 bg-[#eadfce]" />
              <span>or</span>
              <span className="h-px flex-1 bg-[#eadfce]" />
            </div>

            <form className="space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-[#2d2a25]">
                  Email address
                </span>
                <span className="mt-2 flex h-14 items-center gap-3 rounded-xl border border-[#ddd3c5] bg-white px-4 text-[#8f887c] shadow-sm shadow-[#8c6b3f]/5 focus-within:border-primary/45">
                  <MailIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#2d2a25] outline-none placeholder:text-[#9a9287]"
                    placeholder="Enter your email"
                    type="email"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#2d2a25]">
                  Password
                </span>
                <span className="mt-2 flex h-14 items-center gap-3 rounded-xl border border-[#ddd3c5] bg-white px-4 text-[#8f887c] shadow-sm shadow-[#8c6b3f]/5 focus-within:border-primary/45">
                  <LockIcon />
                  <input
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#2d2a25] outline-none placeholder:text-[#9a9287]"
                    placeholder="Enter your password"
                    type="password"
                  />
                  <EyeIcon />
                </span>
              </label>

              <div className="flex justify-end">
                <a
                  className="text-sm font-medium text-primary hover:text-[#df6040]"
                  href="#"
                >
                  Forgot password?
                </a>
              </div>

              <button
                className="h-14 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:bg-primary/90"
                type="submit"
              >
                Log in
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#625d52]">
              Don&apos;t have an account?{" "}
              <a className="font-bold text-[#df6040]" href="#">
                Sign up
              </a>
            </p>

            <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#eadfce] bg-[#fffaf4] sm:grid-cols-3">
              {featureTiles.map((tile, index) => (
                <div
                  className="relative px-4 py-6 text-center"
                  key={tile.title}
                >
                  {index > 0 ? (
                    <span className="absolute left-0 top-1/2 hidden h-20 w-px -translate-y-1/2 bg-[#eadfce] sm:block" />
                  ) : null}
                  <span
                    className={`mx-auto grid size-12 place-items-center rounded-full ${tile.bg} ${tile.color}`}
                  >
                    {tile.icon}
                  </span>
                  <h2 className={`mt-3 text-sm font-bold ${tile.color}`}>
                    {tile.title}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-[#625d52]">
                    {tile.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-xs leading-6 text-[#625d52]">
              By continuing, you agree to our{" "}
              <a className="font-medium text-[#2d2a25]" href="#">
                Terms of Service
              </a>{" "}
              and{" "}
              <a className="font-medium text-[#2d2a25]" href="#">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </section>

        <section className="relative hidden min-h-[calc(100vh-2.5rem)] overflow-hidden rounded-4xl lg:block">
          <Image
            alt="Creamy pasta with cherry tomatoes and basil"
            className="object-cover"
            fill
            priority
            sizes="50vw"
            src="/images/pasta-hero.png"
          />
          <div className="absolute inset-0 bg-linear-to-br from-[#FEF9F5]/95 via-[#FEF9F5]/35 to-transparent" />

          <div className="absolute right-8 top-6">
            <button className="flex h-11 items-center gap-2 rounded-xl border border-[#ddd3c5] bg-white/85 px-4 text-sm font-bold text-[#2d2a25] shadow-sm backdrop-blur">
              <GlobeIcon />
              English
              <ChevronDownIcon />
            </button>
          </div>

          <div className="absolute left-14 top-24 max-w-md">
            <h2 className="[font-family:var(--font-noto-serif)] text-5xl font-bold leading-tight tracking-tight text-primary">
              Turn what you have into something{" "}
              <span className="text-[#df6040]">delicious.</span>
            </h2>
            <p className="mt-5 max-w-xs text-lg leading-8 text-[#2d2a25]">
              Join thousands of home cooks who are saving time, reducing waste,
              and eating better every day.
            </p>
          </div>

          <div className="absolute bottom-14 left-20 max-w-[430px] rounded-4xl bg-white/90 p-8 shadow-2xl shadow-[#8c6b3f]/15 backdrop-blur">
            <p className="text-5xl font-bold leading-none text-[#df6040]">
              &ldquo;
            </p>
            <p className="-mt-2 text-base leading-7 text-[#2d2a25]">
              Recipe Remix helps me make amazing meals with what I already
              have. It&apos;s a game changer!
            </p>
            <p className="mt-4 text-[#e3a217]">5.0 rating</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-[#e9d8c2] text-sm font-bold text-primary">
                SJ
              </span>
              <div>
                <p className="font-bold text-[#2d2a25]">Sarah J.</p>
                <p className="text-sm text-[#625d52]">Home Cook</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M21.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 .9-3.4.9a6 6 0 0 1-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.4-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.6A6 6 0 0 1 12 6Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M16.6 13c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.1-2.8.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7 1.4 0 1.8.7 3 .7 1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.3-.9-2.3-3.6ZM14.2 6.1c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 0 2-.5 2.7-1.3Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"
        fill="#1877F2"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v10H6z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
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
      className="size-6"
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
      <path d="M9 7c1.5-1 3.5-1 5 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M20.4 6.7a5 5 0 0 0-7.1 0L12 8l-1.3-1.3a5 5 0 0 0-7.1 7.1L12 22l8.4-8.2a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}

function GlobeIcon() {
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
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path d="M3.6 9h16.8" />
      <path d="M3.6 15h16.8" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function ChevronDownIcon() {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
