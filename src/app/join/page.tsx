"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { AuthButton } from "@/components/layout/auth-button";

export default function JoinPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [newDestination, setNewDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    setLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("moving_move_members")
      .select("move_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      router.push("/dashboard");
      return;
    }

    const { data: moveData, error: moveError } = await supabase
      .from("moving_moves")
      .insert({ destination: newDestination.trim() })
      .select("id")
      .single();

    if (moveError || !moveData) {
      setError(moveError?.message || "Failed to create move.");
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("moving_move_members")
      .insert({ move_id: moveData.id, user_id: user.id, role: "owner" });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!inviteCode.trim()) {
      setError("Please enter an invite code.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("moving_move_members")
      .select("move_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      router.push("/dashboard");
      return;
    }

    const { data: moveData, error: moveError } = await supabase
      .from("moving_moves")
      .select("id")
      .eq("invite_code", inviteCode.trim())
      .maybeSingle();

    if (moveError || !moveData) {
      setError("Invalid invite code. Please check and try again.");
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("moving_move_members")
      .insert({ move_id: moveData.id, user_id: user.id, role: "collaborator" });

    if (memberError) {
      if (memberError.message.includes("unique") || memberError.message.includes("duplicate")) {
        setError("You are already in a move.");
      } else {
        setError(memberError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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
            Join or create a move to start collaborating with your family.
          </p>
        </div>

        <div className="app-card grain-overlay rounded-[28px] p-6">
          {mode === "choose" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Where are you moving to?
                </label>
                <input
                  type="text"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="e.g. Accra, Ghana"
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading || !newDestination.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 disabled:opacity-60 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create a new move
              </button>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => setMode("join")}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
              >
                Join an existing move
              </button>
            </div>
          )}

          {mode === "join" && (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Invite code
                </label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white"
                />
              </div>

              {error ? (
                <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">
                  {error}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setMode("choose"); setError(null); }}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-slate-700 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Join move
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
