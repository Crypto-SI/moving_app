"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote,
  Download,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  NotebookPen,
  Package,
  School,
  Settings,
  Share2,
  ShipWheel,
  Sun,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { navItems } from "@/lib/navigation";
import { useRelocation } from "@/lib/data-hooks";
import { useMockDataToggle, MockDataProvider } from "@/lib/data-context";
import { useCurrentMove, MoveProvider } from "@/lib/move-context";
import { useTheme, ThemeProvider } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { AuthButton } from "@/components/layout/auth-button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/family-members": Users,
  "/documents": FileText,
  "/shipping": ShipWheel,
  "/housing": Home,
  "/household-inventory": Package,
  "/schooling": School,
  "/healthcare": HeartPulse,
  "/budget": Banknote,
  "/miscellaneous-notes": NotebookPen,
} as const;

function getDaysRemaining(targetDate: string) {
  const [y, m, d] = targetDate.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = target.getTime() - startOfToday.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateShort(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

function InviteCodeModal({ onClose, inviteCode }: { onClose: () => void; inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text = `Join my RelocateGH move! Invite code: ${inviteCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "RelocateGH", text });
      } catch {}
    } else {
      await handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Invite</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Share invite code</h3>
          </div>
          <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Share this code with family members so they can join your move.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50 px-4 py-3">
          <span className="font-mono text-2xl font-bold tracking-[0.3em] text-teal-700">{inviteCode}</span>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 rounded-full bg-[var(--foreground)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {copied ? "Copied!" : "Copy code"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  onClose,
  onInvite,
  onLeave,
}: {
  onClose: () => void;
  onInvite: () => void;
  onLeave: () => void;
}) {
  const router = useRouter();
  const { theme, setTheme, resolved } = useTheme();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(display-mode: standalone)").matches
      : false,
  );
  const [showIosHint, setShowIosHint] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const handleInstall = useCallback(async () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    if (isIOS && !installPrompt) {
      setShowIosHint(true);
      return;
    }
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }, [installPrompt]);

  const handleUpdateApp = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    setUpdating(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      }
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch {
      setUpdating(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const themeIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  const cycleTheme = useCallback(() => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-[400px] overflow-y-auto rounded-l-[32px] border-l border-white/60 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Settings</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-900">Preferences</h3>
          </div>
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={cycleTheme}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            <ThemeIcon className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-left font-medium">
              {theme === "system"
                ? `System (${resolved})`
                : theme === "dark"
                  ? "Dark mode"
                  : "Light mode"}
            </span>
            <span className="text-xs text-slate-400">Theme</span>
          </button>

          <button
            type="button"
            onClick={onInvite}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-100"
          >
            <UserPlus className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-left font-medium">Invite</span>
          </button>

          <button
            type="button"
            onClick={handleInstall}
            disabled={isStandalone}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <Download className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-left font-medium">{isStandalone ? "App installed" : "Download app"}</span>
          </button>

          {showIosHint && (
            <p className="px-4 py-2 text-xs text-slate-400">
              Tap the share icon (<Share2 className="inline h-3 w-3" />) then
              &quot;Add to Home Screen&quot; to install.
            </p>
          )}

          <button
            type="button"
            onClick={handleUpdateApp}
            disabled={updating}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span className="flex-1 text-left font-medium">{updating ? "Updating…" : "Update app"}</span>
          </button>

          <div className="my-2 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 text-slate-500" />
            <span className="flex-1 text-left font-medium">{loggingOut ? "Logging out…" : "Log out"}</span>
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3.5 text-sm text-rose-600 transition hover:bg-rose-100"
          >
            <LogOut className="h-5 w-5" />
            <span className="flex-1 text-left font-medium">Leave move</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [editingDestination, setEditingDestination] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [savingDestination, setSavingDestination] = useState(false);
  const [saveDateError, setSaveDateError] = useState<string | null>(null);
  const [saveDestinationError, setSaveDestinationError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { useMockData, setUseMockData } = useMockDataToggle();
  const { moveId, role } = useCurrentMove();
  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const { relocation, updateRelocation } = useRelocation();
  const moveDate = relocation?.move_date || "";
  const destination = relocation?.destination || "";
  const [editMoveDate, setEditMoveDate] = useState(moveDate);
  const [editDestination, setEditDestination] = useState(destination);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => { setEditMoveDate(moveDate); }, [moveDate]);
  useEffect(() => { if (!editingDestination) setEditDestination(destination); }, [destination, editingDestination]);

  useEffect(() => {
    if (moveId) {
      const supab = createBrowserClient();
      supab.from("moving_moves").select("invite_code").eq("id", moveId).single().then(({ data }) => {
        if (data) setInviteCode(data.invite_code);
      });
    }
  }, [moveId]);

  const handleSaveDates = async () => {
    setSavingDate(true);
    setSaveDateError(null);
    try {
      await updateRelocation({ move_date: editMoveDate });
      setEditingDates(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : (err as Record<string, string>)?.message || "Failed to save move date. Please try again.";
      setSaveDateError(msg);
    } finally {
      setSavingDate(false);
    }
  };

  const handleStartEditing = () => {
    setEditMoveDate(moveDate);
    setSaveDateError(null);
    setEditingDates(true);
  };

  const handleCancelEditing = () => {
    setEditMoveDate(moveDate);
    setEditingDates(false);
  };

  const handleSaveDestination = async () => {
    if (!editDestination.trim()) {
      setSaveDestinationError("Destination cannot be empty.");
      return;
    }
    setSavingDestination(true);
    setSaveDestinationError(null);
    try {
      await updateRelocation({ destination: editDestination.trim() });
      setEditingDestination(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save destination.";
      setSaveDestinationError(msg);
    } finally {
      setSavingDestination(false);
    }
  };

  const handleStartEditingDestination = () => {
    setEditDestination(destination);
    setSaveDestinationError(null);
    setEditingDestination(true);
  };

  const handleCancelEditingDestination = () => {
    setEditDestination(destination);
    setEditingDestination(false);
  };

  const handleInvite = useCallback(() => {
    setShowInvite(true);
  }, []);

  const handleLeave = useCallback(async () => {
    const supabase = createBrowserClient();
    await supabase.from("moving_move_members").delete().eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
    router.push("/join");
  }, [router]);

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-900">
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-[288px] overflow-y-auto rounded-[32px] border border-white/60 bg-slate-950/92 p-5 text-white shadow-2xl lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/Relocateghlogo.png" alt="RelocateGH logo" width={44} height={44} className="rounded-2xl object-contain" />
          <div>
            <p className="text-lg font-semibold">RelocateGH</p>
            <p className="text-sm text-slate-400">Family move command centre</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.href];
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active ? "bg-white/12 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="app-card mt-8 rounded-[28px] p-4 text-slate-800">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Current move</p>
          {editingDestination ? (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
                placeholder="e.g. Accra, Ghana"
                className="w-full rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-300"
              />
              <div className="flex gap-2">
                {saveDestinationError && (
                  <p className="flex-1 text-xs text-rose-600">{saveDestinationError}</p>
                )}
                <button
                  type="button"
                  onClick={handleSaveDestination}
                  disabled={savingDestination}
                  className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {savingDestination ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditingDestination}
                  disabled={savingDestination}
                  className="rounded-xl border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="mt-2 font-serif text-3xl">{destination || "Set destination"}</p>
                <button
                  type="button"
                  onClick={handleStartEditingDestination}
                  className="mt-2 shrink-0 text-xs text-teal-600 underline decoration-teal-300 underline-offset-2 hover:text-teal-700"
                >
                  Edit
                </button>
              </div>
            </>
          )}
          {role && (
            <p className="mt-1 text-xs text-slate-500">
              {role === "owner" ? "Owner" : "Collaborator"}
              {inviteCode && (
                <> &middot; Code: <span className="font-mono font-semibold">{inviteCode}</span></>
              )}
            </p>
          )}
        </div>
        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-[86%] max-w-[320px] overflow-y-auto border-r border-white/20 bg-slate-950 p-5 text-white" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/Relocateghlogo.png" alt="RelocateGH logo" width={36} height={36} className="rounded-xl object-contain" />
                <div>
                  <p className="text-lg font-semibold">RelocateGH</p>
                  <p className="text-sm text-slate-400">Prototype menu</p>
                </div>
              </div>
              <button className="rounded-full p-2 hover:bg-white/10" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = iconMap[item.href];
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => { setOpen(false); setShowSettings(true); }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="lg:pl-[324px]">
        <div className="px-3 pb-8 pt-3 sm:px-4 md:px-6 md:pb-10 lg:px-8">
          <div className="sticky top-0 z-30 mb-6 space-y-3 rounded-[24px] bg-[rgba(244,239,231,0.78)] py-2 backdrop-blur-xl sm:space-y-4 sm:rounded-[30px]">
            <div className="app-card flex flex-col gap-4 rounded-[28px] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button className="shrink-0 rounded-2xl border border-white/70 bg-white/85 p-3 text-slate-700 lg:hidden" onClick={() => setOpen(true)}>
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Current section</p>
                  <h2 className="font-serif text-2xl font-semibold sm:text-3xl">{current?.label ?? "RelocateGH"}</h2>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:justify-end">
                <Toggle
                  checked={useMockData}
                  onChange={setUseMockData}
                  labelOn="Demo data"
                  labelOff="Live data"
                />
                <Button variant="secondary" className="w-full sm:w-auto" onClick={handleInvite}>Invite</Button>
                <AuthButton />
              </div>
            </div>

            <div className="app-card overflow-hidden rounded-[28px] px-4 py-3 md:px-6">
              <div
                className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold text-slate-700">Move date countdown</span>
                    {moveDate && <span className="text-sm text-slate-500">{getDaysRemaining(moveDate)} days left</span>}
                  </div>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
                  <span className="text-sm text-slate-500">
                    {moveDate ? formatDateShort(moveDate) : "\u2014"}
                  </span>
                  {editingDates ? null : (
                    <button
                      type="button"
                      onClick={handleStartEditing}
                      className="text-xs text-teal-600 underline decoration-teal-300 underline-offset-2 hover:text-teal-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {editingDates && (
                <div className="pt-4">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-slate-500">Move date</label>
                      <input
                        type="date"
                        value={editMoveDate}
                        onChange={(e) => setEditMoveDate(e.target.value)}
                        className="w-full rounded-xl border border-white/70 bg-white/85 px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      {saveDateError && (
                        <p className="flex-1 text-xs text-rose-600">{saveDateError}</p>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveDates}
                        disabled={savingDate}
                        className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
                      >
                        {savingDate ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        disabled={savingDate}
                        className="rounded-xl border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {children}
        </div>
      </main>

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onInvite={() => { setShowSettings(false); setShowInvite(true); }}
          onLeave={() => { setShowSettings(false); setShowLeaveConfirm(true); }}
        />
      )}

      {showInvite && inviteCode && (
        <InviteCodeModal inviteCode={inviteCode} onClose={() => setShowInvite(false)} />
      )}

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4" onClick={() => setShowLeaveConfirm(false)}>
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-semibold text-slate-900">Leave move?</h3>
            <p className="mt-2 text-sm text-slate-500">
              You will lose access to all data in this move. You can create or join a different move afterwards.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLeave}
                className="flex-1 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Leave move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MockDataProvider>
        <MoveProvider>
          <AppShellInner>{children}</AppShellInner>
        </MoveProvider>
      </MockDataProvider>
    </ThemeProvider>
  );
}
