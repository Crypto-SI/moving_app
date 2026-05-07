"use client";

import { Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { AuthButton } from "@/components/layout/auth-button";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
      window.location.href = "/join";
    } else {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }
      setSuccess("Account created! Check your email to confirm, then log in.");
      setMode("login");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="fixed top-4 right-4 z-50">
        <AuthButton />
      </div>
      <div className="w-full max-w-[420px] space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-teal-500/20 to-amber-500/20">
            <Image src="/Relocateghlogo.png" alt="RelocateGH logo" width={64} height={64} className="rounded-[16px] object-contain" />
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900">
            RelocateGH
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            Your family relocation command centre. Organise documents, shipping,
            housing, schooling and every detail of your move to Ghana in one
            place.
          </p>
        </div>

        <div className="app-card grain-overlay rounded-[28px] p-6">
          <div className="mb-5 flex gap-1 rounded-2xl bg-slate-100/80 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">
            Built by{" "}
            <a
              href="https://webarastudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-2 transition hover:text-teal-600"
            >
              WebAra Studio
            </a>
          </p>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            A cryptoSI DAO project
          </p>
        </div>
      </div>
    </div>
  );
}
