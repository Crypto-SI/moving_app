"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-shell/app-header";
import { AppSidebar } from "@/components/layout/app-shell/app-sidebar";
import { useDeferredPrompt } from "@/components/layout/app-shell/install-prompt";
import { InviteCodeModal } from "@/components/layout/app-shell/invite-code-modal";
import { LeaveMoveModal } from "@/components/layout/app-shell/leave-move-modal";
import { MobileNavDrawer } from "@/components/layout/app-shell/mobile-nav-drawer";
import { SettingsPanel } from "@/components/layout/app-shell/settings-panel";
import { MockDataProvider, useMockDataToggle } from "@/lib/data-context";
import { useRelocation } from "@/lib/data-hooks";
import { MoveProvider, useCurrentMove } from "@/lib/move-context";
import { navItems } from "@/lib/navigation";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { ThemeProvider } from "@/lib/theme-context";

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { useMockData, setUseMockData } = useMockDataToggle();
  const { moveId, role } = useCurrentMove();
  const { relocation, updateRelocation } = useRelocation();
  const { prompt: installPrompt, consume: handleInstall } = useDeferredPrompt();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const [editingDestination, setEditingDestination] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [savingDestination, setSavingDestination] = useState(false);
  const [saveDateError, setSaveDateError] = useState<string | null>(null);
  const [saveDestinationError, setSaveDestinationError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isStandalone] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(display-mode: standalone)").matches : false,
  );

  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const moveDate = relocation?.move_date || "";
  const destination = relocation?.destination || "";
  const [editMoveDate, setEditMoveDate] = useState(moveDate);
  const [editDestination, setEditDestination] = useState(destination);

  useEffect(() => {
    setEditMoveDate(moveDate);
  }, [moveDate]);

  useEffect(() => {
    if (!editingDestination) setEditDestination(destination);
  }, [destination, editingDestination]);

  useEffect(() => {
    if (!moveId) {
      setInviteCode(null);
      return;
    }

    const supabase = createBrowserClient();
    supabase
      .from("moving_moves")
      .select("invite_code")
      .eq("id", moveId)
      .single()
      .then(({ data }) => {
        setInviteCode(data?.invite_code ?? null);
      });
  }, [moveId]);

  const handleSaveDates = async () => {
    setSavingDate(true);
    setSaveDateError(null);
    try {
      await updateRelocation({ move_date: editMoveDate });
      setEditingDates(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (err as Record<string, string>)?.message || "Failed to save move date. Please try again.";
      setSaveDateError(message);
    } finally {
      setSavingDate(false);
    }
  };

  const handleStartEditingDate = () => {
    setEditMoveDate(moveDate);
    setSaveDateError(null);
    setEditingDates(true);
  };

  const handleCancelEditingDate = () => {
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
      const message = err instanceof Error ? err.message : "Failed to save destination.";
      setSaveDestinationError(message);
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

  const handleLeave = useCallback(async () => {
    const supabase = createBrowserClient();
    const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
    await supabase.from("moving_move_members").delete().eq("user_id", userId);
    router.push("/join");
  }, [router]);

  return (
    <div className="min-h-screen overflow-x-hidden text-[var(--foreground)]">
      <AppSidebar
        pathname={pathname}
        destination={destination}
        role={role}
        inviteCode={inviteCode}
        editingDestination={editingDestination}
        editDestination={editDestination}
        savingDestination={savingDestination}
        saveDestinationError={saveDestinationError}
        onEditDestinationChange={setEditDestination}
        onStartEditingDestination={handleStartEditingDestination}
        onCancelEditingDestination={handleCancelEditingDestination}
        onSaveDestination={handleSaveDestination}
        onOpenSettings={() => setShowSettings(true)}
      />

      {mobileNavOpen ? (
        <MobileNavDrawer onClose={() => setMobileNavOpen(false)} onOpenSettings={() => setShowSettings(true)} />
      ) : null}

      <main className="lg:pl-[324px]">
        <div className="px-3 pb-8 pt-3 sm:px-4 md:px-6 md:pb-10 lg:px-8">
          <AppHeader
            currentLabel={current?.label ?? "RelocateGH"}
            useMockData={useMockData}
            moveDate={moveDate}
            editingDates={editingDates}
            editMoveDate={editMoveDate}
            savingDate={savingDate}
            saveDateError={saveDateError}
            onMockDataChange={setUseMockData}
            onInvite={() => setShowInvite(true)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onStartEditingDate={handleStartEditingDate}
            onDateChange={setEditMoveDate}
            onSaveDate={handleSaveDates}
            onCancelEditingDate={handleCancelEditingDate}
          />

          {children}
        </div>
      </main>

      {showSettings ? (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onInvite={() => {
            setShowSettings(false);
            setShowInvite(true);
          }}
          onLeave={() => {
            setShowSettings(false);
            setShowLeaveConfirm(true);
          }}
          installPrompt={installPrompt}
          onInstall={handleInstall}
          isStandalone={isStandalone}
        />
      ) : null}

      {showInvite && inviteCode ? <InviteCodeModal inviteCode={inviteCode} onClose={() => setShowInvite(false)} /> : null}

      {showLeaveConfirm ? (
        <LeaveMoveModal onClose={() => setShowLeaveConfirm(false)} onLeave={handleLeave} />
      ) : null}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
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
