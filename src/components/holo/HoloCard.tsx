import type { ReactNode } from "react";
import Image from "next/image";
import { Scanlines } from "./Scanlines";

interface HoloCardProps {
  title?: string;
  subtitle?: string;
  faceAssetUrl?: string | null;
  children?: ReactNode;
  className?: string;
}

/**
 * A holographic card that can optionally render a generated (or
 * placeholder) face asset with the glow/scanline treatment.
 */
export function HoloCard({ title, subtitle, faceAssetUrl, children, className = "" }: HoloCardProps) {
  return (
    <div
      className={`holo-frame holo-glow group relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] backdrop-blur-md transition-transform duration-500 hover:-translate-y-1 ${className}`}
    >
      <Scanlines />
      {faceAssetUrl ? (
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={faceAssetUrl}
            alt={title ? `${title} — face asset` : "Generated face asset"}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-90 mix-blend-screen"
          />
          <div className="holo-face-tint absolute inset-0" />
        </div>
      ) : null}
      <div className="relative z-10 space-y-1 p-5">
        {title ? <h3 className="text-base font-semibold text-cyan-50">{title}</h3> : null}
        {subtitle ? <p className="text-xs uppercase tracking-widest text-cyan-300/70">{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}
