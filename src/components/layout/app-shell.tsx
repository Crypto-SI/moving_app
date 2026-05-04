"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCent,
  Banknote,
  ChevronDown,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Package,
  School,
  ShipWheel,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { navItems } from "@/lib/navigation";
import { useTimelineTasks, useRelocation } from "@/lib/data-hooks";
import { useMockDataToggle, MockDataProvider } from "@/lib/data-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/components/ui/toggle";

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/family-members": Users,
  "/documents": FileText,
  "/moving-timeline": ClipboardCheck,
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

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  const { useMockData, setUseMockData } = useMockDataToggle();
  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const { data: timelineTasks } = useTimelineTasks();
  const { relocation, updateRelocation } = useRelocation();
  const moveDate = relocation?.move_date || "";
  const [editMoveDate, setEditMoveDate] = useState(moveDate);
  const urgentTasks = timelineTasks.filter((task) => task.priority === "urgent" || task.priority === "high").slice(0, 3);
  const overdueCount = timelineTasks.filter((task) => new Date(task.due_date) < new Date() && task.status !== "done").length;
  const progress = useMemo(() => {
    if (timelineTasks.length === 0) return 0;
    return Math.round((timelineTasks.filter((task) => task.status === "done").length / timelineTasks.length) * 100);
  }, [timelineTasks]);

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

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-900">
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-[288px] rounded-[32px] border border-white/60 bg-slate-950/92 p-5 text-white shadow-2xl lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-200">
            <BadgeCent className="h-5 w-5" />
          </div>
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
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-[86%] max-w-[320px] overflow-y-auto border-r border-white/20 bg-slate-950 p-5 text-white" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">RelocateGH</p>
                <p className="text-sm text-slate-400">Prototype menu</p>
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
              <button
                type="button"
                className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
                aria-expanded={summaryOpen}
                aria-controls="move-summary-panel"
                onClick={() => setSummaryOpen((value) => !value)}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold text-slate-700">Move date countdown</span>
                    {moveDate && <span className="text-sm text-slate-500">{getDaysRemaining(moveDate)} days left</span>}
                  </div>
                  <div className="mt-2 w-full max-w-[360px]">
                    <Progress value={progress} />
                  </div>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">{progress}% complete</Badge>
                    <Badge tone={overdueCount > 0 ? "danger" : "success"}>{overdueCount} overdue</Badge>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-600 transition hover:bg-white">
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 ease-out", summaryOpen && "rotate-180")} />
                  </span>
                </div>
              </button>

              <div
                id="move-summary-panel"
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                  summaryOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="grid gap-4 pt-4 xl:grid-cols-[1.2fr,1fr,1fr,1fr]">
                    <div>
                      <p className="text-sm text-slate-600">Overall progress is {progress}% with housing mostly settled and documents still driving urgency.</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Next urgent tasks</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {urgentTasks.map((task) => (
                          <Badge key={task.id} tone="warning">{task.title}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Overdue items</p>
                      <p className="mt-2 text-3xl font-semibold text-rose-700">{overdueCount}</p>
                      <p className="text-sm text-slate-500">Nothing slips past the move summary bar.</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Move target</p>
                      {editingDates ? (
                        <div className="mt-2 space-y-2">
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
                      ) : (
                        <div className="mt-2">
                          <p className="text-3xl font-semibold">{moveDate ? formatDateShort(moveDate) : "—"}</p>
                          <button
                            type="button"
                            onClick={handleStartEditing}
                            className="mt-1 text-xs text-teal-600 underline decoration-teal-300 underline-offset-2 hover:text-teal-700"
                          >
                            Edit dates
                          </button>
                          <p className="mt-1 text-sm text-slate-500">Accra arrival with school onboarding already scheduled.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
    <MockDataProvider>
      <AppShellInner>{children}</AppShellInner>
    </MockDataProvider>
  );
}
