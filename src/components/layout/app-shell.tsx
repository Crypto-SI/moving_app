"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Banknote,
  Download,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
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
import { useTheme, ThemeProvider } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

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
  const now = new Date();
  const diff = new Date(targetDate).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function SettingsSection({ onInvite }: { onInvite: () => void }) {
  const { theme, setTheme, resolved } = useTheme();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(display-mode: standalone)").matches
      : false,
  );
  const [showIosHint, setShowIosHint] = useState(false);

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

  const themeIcon =
    theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const ThemeIcon = themeIcon;

  const cycleTheme = useCallback(() => {
    const next =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300">
        <Settings className="h-4 w-4" />
        <span className="font-medium text-slate-400">Settings</span>
      </div>

      <button
        type="button"
        onClick={cycleTheme}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
      >
        <ThemeIcon className="h-4 w-4" />
        <span className="flex-1 text-left">
          {theme === "system"
            ? `System (${resolved})`
            : theme === "dark"
              ? "Dark"
              : "Light"}
        </span>
        <span className="text-xs text-slate-500">Theme</span>
      </button>

      <button
        type="button"
        onClick={onInvite}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
      >
        <UserPlus className="h-4 w-4" />
        <span>Invite</span>
      </button>

      <button
        type="button"
        onClick={handleInstall}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
      >
        <Download className="h-4 w-4" />
        <span>{isStandalone ? "App installed" : "Download app"}</span>
      </button>

      {showIosHint && (
        <p className="px-4 py-2 text-xs text-slate-400">
          Tap the share icon (<Share2 className="inline h-3 w-3" />) then
          &quot;Add to Home Screen&quot; to install.
        </p>
      )}
    </div>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const { useMockData, setUseMockData } = useMockDataToggle();
  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const { relocation, updateRelocation } = useRelocation();
  const moveDate = relocation?.move_date || "";
  const [editMoveDate, setEditMoveDate] = useState(moveDate);

  const handleSaveDates = async () => {
    await updateRelocation({ move_date: editMoveDate });
    setEditingDates(false);
  };

  const handleStartEditing = () => {
    setEditMoveDate(moveDate);
    setEditingDates(true);
  };

  const handleCancelEditing = () => {
    setEditMoveDate(moveDate);
    setEditingDates(false);
  };

  const handleInvite = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: "RelocateGH", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, []);

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
          <p className="mt-2 font-serif text-3xl">Accra, Ghana</p>
          <p className="mt-2 text-sm text-slate-600">Shared structure is ready for future Supabase tables, row CRUD, and mobile parity.</p>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4">
          <SettingsSection onInvite={handleInvite} />
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
              <SettingsSection onInvite={handleInvite} />
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
                <Button variant="secondary" className="w-full sm:w-auto">Invite adviser</Button>
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
                    {moveDate ? formatDateShort(moveDate) : "—"}
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
                      <button
                        type="button"
                        onClick={handleSaveDates}
                        className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="rounded-xl border border-white/70 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-white"
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
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MockDataProvider>
        <AppShellInner>{children}</AppShellInner>
      </MockDataProvider>
    </ThemeProvider>
  );
}
