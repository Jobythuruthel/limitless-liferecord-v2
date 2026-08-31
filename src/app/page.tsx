import Link from "next/link";
import { HoloLink } from "@/components/holo/HoloButton";
import { HoloFrame } from "@/components/holo/HoloFrame";
import { HoloCard } from "@/components/holo/HoloCard";
import { RevealSection } from "@/components/RevealSection";

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      {/* ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh] bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.22),transparent_60%)]"
      />

      {/* Hero */}
      <section className="mx-auto flex min-h-[92vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        <p className="hero-stage hero-stage-1 mb-4 text-xs font-medium uppercase tracking-[0.35em] text-cyan-300/70">
          JOBY AI
        </p>
        <h1 className="hero-stage hero-stage-2 hero-glow-build text-balance text-5xl font-semibold leading-tight text-cyan-50 sm:text-7xl">
          Limitless Liferecord
        </h1>
        <p className="hero-stage hero-stage-3 mt-6 max-w-2xl text-balance text-lg text-cyan-100/70">
          A holographic daily console for your life: curated analysis, synced tasks from
          Basecamp &amp; Slack, and a generated presence — rendered as one continuous,
          glowing record.
        </p>
        <div className="hero-stage hero-stage-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <HoloLink href="/signin" variant="primary">
            Enter the console
          </HoloLink>
          <HoloLink href="#preview" variant="ghost">
            See the interface
          </HoloLink>
        </div>
      </section>

      {/* Holographic UI preview */}
      <RevealSection id="preview" className="mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold text-cyan-50 sm:text-3xl">
            A console built from glass and light
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-cyan-100/60">
            Every surface in the product — cards, panels, buttons — shares one holographic
            language: glass blur, cyan glow, and a slow scanline sweep.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <HoloCard
            title="Daily Analysis"
            subtitle="Curated · Published"
            faceAssetUrl="/face-hologram-real.jpg"
          >
            <p className="text-sm text-cyan-100/70">
              A narrative summary of the day, written and reviewed in the admin console.
            </p>
          </HoloCard>

          <HoloCard title="Synced Tasks" subtitle="Basecamp · Slack">
            <ul className="space-y-2 text-sm text-cyan-100/70">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Ship the changelog
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/50" /> Review design pass
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/30" /> Sync standup notes
              </li>
            </ul>
          </HoloCard>

          <HoloFrame className="flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-cyan-50">Integration Settings</h3>
              <p className="mt-1 text-xs uppercase tracking-widest text-cyan-300/70">Admin only</p>
            </div>
            <p className="mt-4 text-sm text-cyan-100/70">
              Map channels and projects to date-tagging rules — no live call required to
              configure.
            </p>
          </HoloFrame>
        </div>
      </RevealSection>

      <RevealSection className="mx-auto max-w-3xl px-6 pb-32 text-center">
        <HoloFrame>
          <h2 className="text-xl font-semibold text-cyan-50">Ready to open your console?</h2>
          <p className="mt-2 text-sm text-cyan-100/60">
            Sign in to view today&apos;s record, or ask an admin to publish one.
          </p>
          <div className="mt-6">
            <HoloLink href="/signin">Sign in</HoloLink>
          </div>
        </HoloFrame>
      </RevealSection>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-cyan-100/40">
        <Link href="/signin" className="hover:text-cyan-200/70">
          JOBY AI — Limitless Liferecord
        </Link>
      </footer>
    </main>
  );
}
