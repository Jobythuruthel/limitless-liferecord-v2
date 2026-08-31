"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HoloFrame } from "@/components/holo/HoloFrame";
import { HoloButton } from "@/components/holo/HoloButton";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/day/" + new Date().toISOString().slice(0, 10));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <HoloFrame className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-cyan-50">Sign in</h1>
        <p className="mt-1 text-sm text-cyan-100/60">
          Enter the credentials seeded for your account.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs uppercase tracking-widest text-cyan-300/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-50 outline-none focus:border-cyan-300/50"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-widest text-cyan-300/70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-50 outline-none focus:border-cyan-300/50"
            />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <HoloButton type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </HoloButton>
        </form>
      </HoloFrame>
    </main>
  );
}
