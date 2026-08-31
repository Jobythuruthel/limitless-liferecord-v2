"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function RevealSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      id={id}
      ref={ref}
      className={`reveal ${isRevealed ? "reveal-visible" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
