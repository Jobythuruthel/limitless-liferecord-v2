import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HoloFrame } from "@/components/holo/HoloFrame";
import { HoloCard } from "@/components/holo/HoloCard";

export default async function DayConsolePage({ params }: { params: { date: string } }) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "admin";

  const [analysis, tasks] = await Promise.all([
    prisma.dailyAnalysis.findUnique({ where: { date: params.date } }),
    prisma.dailyTask.findMany({ where: { date: params.date }, orderBy: { order: "asc" } }),
  ]);

  const showAnalysis = analysis && (analysis.published || isAdmin);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Day console</p>
        <h1 className="mt-2 text-3xl font-semibold text-cyan-50">{params.date}</h1>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-sm uppercase tracking-widest text-cyan-300/70">Analysis</h2>
        {showAnalysis ? (
          <HoloFrame>
            {!analysis?.published ? (
              <p className="mb-3 inline-block rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                Unpublished — visible to admins only
              </p>
            ) : null}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-cyan-100/80">
              {analysis?.analysisText}
            </p>
          </HoloFrame>
        ) : (
          <HoloFrame>
            <p className="text-sm text-cyan-100/50">No published analysis for this date yet.</p>
          </HoloFrame>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm uppercase tracking-widest text-cyan-300/70">Tasks</h2>
        {tasks.length === 0 ? (
          <HoloFrame>
            <p className="text-sm text-cyan-100/50">No tasks recorded for this date.</p>
          </HoloFrame>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tasks.map((task) => (
              <HoloCard key={task.id} title={task.title} subtitle={task.status}>
                <p className="text-sm text-cyan-100/70">{task.description}</p>
                {task.sourceRef ? (
                  <p className="mt-2 text-[11px] text-cyan-300/50">source: {task.sourceRef}</p>
                ) : null}
              </HoloCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
