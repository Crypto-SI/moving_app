"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";

export function AuthButton({ className }: { className?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setEmail(null);
    setLoading(false);
    router.push("/login");
  }

  if (email) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <div className="hidden items-center gap-1.5 sm:flex">
          <User className="h-3.5 w-3.5 text-slate-500" />
          <span className="max-w-[140px] truncate text-xs text-slate-500">{email}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className={`flex items-center gap-1.5 rounded-full bg-[var(--foreground)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 ${className ?? ""}`}
    >
      <LogIn className="h-3.5 w-3.5" />
      Log in
    </Link>
  );
}
