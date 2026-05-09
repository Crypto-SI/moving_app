"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-shell/app-header";
import { AppSidebar } from "@/components/layout/app-shell/app-sidebar";
import { useDeferredPrompt } from "@/components/layout/app-shell/install-prompt";
import { InviteCodeModal } from "@/components/layout/app-shell/invite-code-modal";
import { LeaveMoveModal } from "@/components/layout/app-shell/leave-move-modal";
import { MobileNavDrawer } from "@/components/layout/app-shell/mobile-nav-drawer";
import { SettingsPanel } from "@/components/layout/app-shell/settings-panel";
import { MockDataProvider, useMockDataToggle } from "@/lib/data-context";
import { useRelocation } from "@/lib/hooks/use-relocation";
import { useInlineFieldEditor } from "@/lib/hooks/use-inline-field-editor";
import { useInviteCode } from "@/lib/hooks/use-invite-code";
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
  const [showInvite, setShowInvite] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isStandalone] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(display-mode: standalone)").matches : false,
  );

  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const moveDate = relocation?.move_date || "";
  const destination = relocation?.destination || "";

  const { inviteCode } = useInviteCode(moveId);

  const dateEditor = useInlineFieldEditor({
    onSave: (value) => updateRelocation({ move_date: value }),
    getInitialValue: () => moveDate,
  });

  const destinationEditor = useInlineFieldEditor({
    onSave: (value) => updateRelocation({ destination: value.trim() }),
    getInitialValue: () => destination,
    validate: (value) => (!value.trim() ? "Destination cannot be empty." : null),
  });

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
        editingDestination={destinationEditor.editing}
        editDestination={destinationEditor.value}
        savingDestination={destinationEditor.saving}
        saveDestinationError={destinationEditor.error}
        onEditDestinationChange={destinationEditor.onChange}
        onStartEditingDestination={destinationEditor.startEditing}
        onCancelEditingDestination={destinationEditor.cancelEditing}
        onSaveDestination={destinationEditor.save}
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
            editingDates={dateEditor.editing}
            editMoveDate={dateEditor.value}
            savingDate={dateEditor.saving}
            saveDateError={dateEditor.error}
            onMockDataChange={setUseMockData}
            onInvite={() => setShowInvite(true)}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onStartEditingDate={dateEditor.startEditing}
            onDateChange={dateEditor.onChange}
            onSaveDate={dateEditor.save}
            onCancelEditingDate={dateEditor.cancelEditing}
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
