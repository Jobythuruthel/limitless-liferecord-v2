import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface HoloButtonBaseProps {
  variant?: "primary" | "ghost";
  className?: string;
}

type HoloButtonProps = HoloButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

interface HoloLinkProps extends HoloButtonBaseProps {
  href: string;
  children: React.ReactNode;
}

const base =
  "holo-btn relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

const variants = {
  primary:
    "bg-cyan-400/10 text-cyan-100 border border-cyan-300/40 hover:bg-cyan-400/20 hover:border-cyan-200/70 hover:shadow-[0_0_30px_-6px_rgba(56,224,255,0.65)]",
  ghost:
    "bg-transparent text-cyan-200/80 border border-white/10 hover:border-cyan-300/40 hover:text-cyan-100",
};

export function HoloButton({ variant = "primary", className = "", ...props }: HoloButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function HoloLink({ variant = "primary", className = "", href, children }: HoloLinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
