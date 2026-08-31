"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Attaches an IntersectionObserver to the returned ref and flips
 * `isRevealed` to true the first time the element enters the viewport.
 * Pure CSS (transform/opacity) is expected to drive the actual animation
 * via the `.reveal` / `.reveal-visible` classes — this hook only toggles
 * visibility state, it never animates directly.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15 },
) {
  const ref = useRef<T | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsRevealed(true);
        observer.disconnect();
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isRevealed };
}
