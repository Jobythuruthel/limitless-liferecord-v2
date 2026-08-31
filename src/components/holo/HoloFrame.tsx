import type { ReactNode } from "react";
import { Scanlines } from "./Scanlines";

export function HoloFrame({
  children,
  className = "",
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`holo-frame relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-white/[0.03] p-6 backdrop-blur-md ${
        glow ? "holo-glow" : ""
      } ${className}`}
    >
      <Scanlines />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
