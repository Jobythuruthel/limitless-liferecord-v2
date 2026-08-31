export function Scanlines({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
    >
      <div className="holo-scanlines absolute inset-0" />
      <div className="holo-sweep absolute inset-0" />
    </div>
  );
}
