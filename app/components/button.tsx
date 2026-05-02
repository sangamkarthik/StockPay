import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const baseClasses =
  "inline-flex items-center justify-center font-medium transition";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/15 hover:bg-primary/90",
  outline:
    "border border-primary/35 bg-white/60 text-primary hover:bg-white",
  secondary:
    "border border-[#ddd3c5] bg-white/70 text-[#2d2a25] shadow-sm hover:bg-white",
  ghost: "text-[#2d2a25]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-11 rounded-lg px-5 text-sm",
  md: "h-12 rounded-xl px-8 text-sm",
  lg: "h-14 rounded-xl px-8 text-base",
};

export function Button({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <a
      className={[
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
