"use client";

import { Download, LogOut, Monitor, Moon, RefreshCcw, Share2, Sun, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import type { BeforeInstallPromptEvent } from "@/components/layout/app-shell/install-prompt";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { useTheme } from "@/lib/theme-context";

export function SettingsPanel({
  onClose,
  onInvite,
  onLeave,
  installPrompt,
  onInstall,
  isStandalone,
}: {
  onClose: () => void;
  onInvite: () => void;
  onLeave: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
  isStandalone: boolean;
}) {
  const router = useRouter();
  const { theme, setTheme, resolved } = useTheme();
  const [updating, setUpdating] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [showFallbackHint, setShowFallbackHint] = useState(false);

  const handleInstallClick = useCallback(() => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;

    if (isIOS && !installPrompt) {
      setShowIosHint(true);
      return;
    }

    if (!installPrompt) {
      setShowFallbackHint(true);
      return;
    }

    onInstall();
  }, [installPrompt, onInstall]);

  const handleUpdateApp = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    setUpdating(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        registration.waiting?.postMessage({ type: "SKIP_WAITING" });
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

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const cycleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-[400px] overflow-y-auto rounded-l-[32px] border-l border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Settings</p>
            <h3 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">Preferences</h3>
          </div>
          <button className="rounded-full p-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-slate-300" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={cycleTheme}
            className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3.5 text-sm text-[var(--foreground)] transition hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <ThemeIcon className="h-5 w-5 text-[var(--muted)]" />
            <span className="flex-1 text-left font-medium">
              {theme === "system" ? `System (${resolved})` : theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <span className="text-xs text-[var(--muted)]">Theme</span>
          </button>

          <SettingsAction onClick={onInvite} icon={<UserPlus className="h-5 w-5 text-[var(--muted)]" />} label="Invite" />

          <SettingsAction
            onClick={handleInstallClick}
            disabled={isStandalone}
            icon={<Download className="h-5 w-5 text-[var(--muted)]" />}
            label={isStandalone ? "App installed" : "Download app"}
          />

          {showIosHint ? (
            <p className="px-4 py-2 text-xs text-[var(--muted)]">
              Tap the share icon (<Share2 className="inline h-3 w-3" />) then &quot;Add to Home Screen&quot; to install.
            </p>
          ) : null}

          {showFallbackHint ? (
            <p className="px-4 py-2 text-xs text-[var(--muted)]">
              Open your browser menu and tap &quot;Install app&quot; or &quot;Add to Home Screen&quot;.
            </p>
          ) : null}

          <SettingsAction
            onClick={handleUpdateApp}
            disabled={updating}
            icon={<RefreshCcw className="h-5 w-5 text-[var(--muted)]" />}
            label={updating ? "Updating..." : "Update app"}
          />

          <div className="my-2 border-t border-[var(--border)]" />

          <SettingsAction
            onClick={handleLogout}
            disabled={loggingOut}
            icon={<LogOut className="h-5 w-5 text-[var(--muted)]" />}
            label={loggingOut ? "Logging out..." : "Log out"}
          />

          <button
            type="button"
            onClick={onLeave}
            className="flex w-full items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3.5 text-sm text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30"
          >
            <LogOut className="h-5 w-5" />
            <span className="flex-1 text-left font-medium">Leave move</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsAction({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3.5 text-sm text-[var(--foreground)] transition hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-white/10"
    >
      {icon}
      <span className="flex-1 text-left font-medium">{label}</span>
    </button>
  );
}
