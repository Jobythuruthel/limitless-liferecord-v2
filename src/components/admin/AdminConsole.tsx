"use client";

import { useEffect, useState } from "react";
import { HoloFrame } from "@/components/holo/HoloFrame";
import { HoloButton } from "@/components/holo/HoloButton";

interface DailyAnalysisRecord {
  id: string;
  date: string;
  analysisText: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DailyTaskRecord {
  id: string;
  date: string;
  title: string;
  description: string;
  status: string;
  sourceRef: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationSettingsRecord {
  id: string;
  provider: "basecamp" | "slack";
  mappingRules: string;
  tokenRef: string | null;
}

const todayIso = new Date().toISOString().slice(0, 10);

export function AdminConsole() {
  const [date, setDate] = useState(todayIso);
  const [analysis, setAnalysis] = useState<DailyAnalysisRecord | null>(null);
  const [analysisText, setAnalysisText] = useState("");
  const [tasks, setTasks] = useState<DailyTaskRecord[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [settings, setSettings] = useState<IntegrationSettingsRecord[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function loadDate(d: string) {
    const [analysisRes, tasksRes] = await Promise.all([
      fetch(`/api/analysis/${d}`),
      fetch(`/api/tasks/${d}`),
    ]);
    const analysisData = analysisRes.ok ? await analysisRes.json() : { analysis: null };
    const tasksData = tasksRes.ok ? await tasksRes.json() : { tasks: [] };
    setAnalysis(analysisData.analysis ?? null);
    setAnalysisText(analysisData.analysis?.analysisText ?? "");
    setTasks(tasksData.tasks ?? []);
  }

  async function loadSettings() {
    const res = await fetch("/api/admin/integration-settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings ?? []);
    }
  }

  useEffect(() => {
    loadDate(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveAnalysis(published: boolean) {
    setStatus("Saving…");
    const res = await fetch(`/api/analysis/${date}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisText, published }),
    });
    if (res.ok) {
      const data = await res.json();
      setAnalysis(data.analysis);
      setStatus(published ? "Published." : "Saved as draft.");
    } else {
      setStatus("Failed to save.");
    }
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;
    const res = await fetch(`/api/tasks/${date}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle }),
    });
    if (res.ok) {
      setNewTaskTitle("");
      loadDate(date);
    }
  }

  async function updateTaskStatus(id: string, taskStatus: string) {
    await fetch(`/api/tasks/item/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: taskStatus }),
    });
    loadDate(date);
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/item/${id}`, { method: "DELETE" });
    loadDate(date);
  }

  async function saveMapping(provider: "basecamp" | "slack", channelIds: string, strategy: string) {
    await fetch("/api/admin/integration-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        mappingRules: {
          channelOrProjectIds: channelIds.split(",").map((s) => s.trim()).filter(Boolean),
          dateTaggingStrategy: strategy,
        },
      }),
    });
    loadSettings();
  }

  async function triggerSync(provider: "basecamp" | "slack") {
    setStatus(`Running ${provider} sync…`);
    const res = await fetch(`/api/sync/${provider}`, { method: "POST" });
    const data = await res.json();
    setStatus(
      res.ok
        ? `${provider} sync ok — ${data.itemsIngested} item(s).`
        : `${provider} sync failed: ${data.message ?? "unknown error"}`,
    );
    loadDate(date);
  }

  const basecampSettings = settings.find((s) => s.provider === "basecamp");
  const slackSettings = settings.find((s) => s.provider === "slack");

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-cyan-50">Content console</h1>
        </div>
        <div>
          <label className="mr-2 text-xs uppercase tracking-widest text-cyan-300/70">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-cyan-50"
          />
        </div>
      </header>

      {status ? (
        <p className="mb-6 rounded-lg border border-cyan-300/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-100/80">
          {status}
        </p>
      ) : null}

      <section className="mb-10">
        <HoloFrame>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest text-cyan-300/70">Daily analysis</h2>
            {analysis ? (
              <span className="text-[11px] text-cyan-300/50">
                created {new Date(analysis.createdAt).toLocaleString()} · updated{" "}
                {new Date(analysis.updatedAt).toLocaleString()}
              </span>
            ) : null}
          </div>
          <textarea
            value={analysisText}
            onChange={(e) => setAnalysisText(e.target.value)}
            rows={6}
            placeholder="Write the narrative analysis for this date…"
            className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-cyan-50 outline-none focus:border-cyan-300/50"
          />
          <div className="mt-4 flex items-center gap-3">
            <HoloButton variant="ghost" onClick={() => saveAnalysis(false)}>
              Save draft
            </HoloButton>
            <HoloButton onClick={() => saveAnalysis(true)}>
              {analysis?.published ? "Update & keep published" : "Publish"}
            </HoloButton>
            {analysis?.published ? (
              <HoloButton variant="ghost" onClick={() => saveAnalysis(false)}>
                Unpublish
              </HoloButton>
            ) : null}
            <span
              className={`ml-auto rounded-full px-3 py-1 text-xs ${
                analysis?.published
                  ? "border border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                  : "border border-amber-300/30 bg-amber-400/10 text-amber-200"
              }`}
            >
              {analysis?.published ? "Published" : "Draft"}
            </span>
          </div>
        </HoloFrame>
      </section>

      <section className="mb-10">
        <HoloFrame>
          <h2 className="mb-3 text-sm uppercase tracking-widest text-cyan-300/70">Tasks</h2>
          <div className="mb-4 flex gap-2">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="New task title…"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-50 outline-none focus:border-cyan-300/50"
            />
            <HoloButton onClick={addTask}>Add</HoloButton>
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
              >
                <span className="flex-1 text-cyan-50">{task.title}</span>
                {task.sourceRef ? (
                  <span className="text-[11px] text-cyan-300/50">{task.sourceRef}</span>
                ) : null}
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-cyan-100"
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                  <option value="blocked">blocked</option>
                </select>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-xs text-red-300/70 hover:text-red-200"
                >
                  delete
                </button>
              </li>
            ))}
            {tasks.length === 0 ? (
              <p className="text-sm text-cyan-100/40">No tasks for this date.</p>
            ) : null}
          </ul>
        </HoloFrame>
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-cyan-300/70">
          Integration settings
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <IntegrationPanel
            provider="basecamp"
            existing={basecampSettings}
            onSave={saveMapping}
            onSync={() => triggerSync("basecamp")}
          />
          <IntegrationPanel
            provider="slack"
            existing={slackSettings}
            onSave={saveMapping}
            onSync={() => triggerSync("slack")}
          />
        </div>
      </section>
    </main>
  );
}

function IntegrationPanel({
  provider,
  existing,
  onSave,
  onSync,
}: {
  provider: "basecamp" | "slack";
  existing?: IntegrationSettingsRecord;
  onSave: (provider: "basecamp" | "slack", channelIds: string, strategy: string) => void;
  onSync: () => void;
}) {
  const parsed = existing ? JSON.parse(existing.mappingRules) : { channelOrProjectIds: [], dateTaggingStrategy: "created_date" };
  const [channelIds, setChannelIds] = useState((parsed.channelOrProjectIds ?? []).join(", "));
  const [strategy, setStrategy] = useState(parsed.dateTaggingStrategy ?? "created_date");

  return (
    <HoloFrame>
      <h3 className="text-base font-semibold capitalize text-cyan-50">{provider}</h3>
      <p className="mt-1 text-xs text-cyan-300/60">
        {provider === "basecamp"
          ? "Maps Basecamp project IDs to date-tagging behavior."
          : "Maps Slack channel IDs to date-tagging behavior."}
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs uppercase tracking-widest text-cyan-300/70">
            {provider === "basecamp" ? "Project IDs (comma-separated)" : "Channel IDs (comma-separated)"}
          </label>
          <input
            value={channelIds}
            onChange={(e) => setChannelIds(e.target.value)}
            placeholder={provider === "basecamp" ? "1234567" : "C0123ABCD"}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-50 outline-none focus:border-cyan-300/50"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-cyan-300/70">
            Date-tagging strategy
          </label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-50"
          >
            <option value="created_date">created_date</option>
            <option value="due_date">due_date</option>
            <option value="today">today</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <HoloButton variant="ghost" onClick={() => onSave(provider, channelIds, strategy)}>
          Save mapping
        </HoloButton>
        <HoloButton onClick={onSync}>Run sync</HoloButton>
      </div>

      <p className="mt-3 text-[11px] text-cyan-300/40">
        {existing?.tokenRef
          ? `tokenRef configured: ${existing.tokenRef}`
          : "No tokenRef — inert until OAuth is completed with real client credentials."}
      </p>
    </HoloFrame>
  );
}
