"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCent,
  Banknote,
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
import { moveDate, timelineTasks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

function getDaysRemaining() {
  const now = new Date("2026-04-14");
  const diff = new Date(moveDate).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const urgentTasks = timelineTasks.filter((task) => task.priority === "urgent" || task.priority === "high").slice(0, 3);
  const overdueCount = timelineTasks.filter((task) => new Date(task.due_date) < new Date("2026-04-14") && task.status !== "done").length;
  const progress = useMemo(() => Math.round((timelineTasks.filter((task) => task.status === "done").length / timelineTasks.length) * 100), []);

  return (
    <div className="min-h-screen text-slate-900">
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
          <div className="h-full w-[86%] max-w-[320px] border-r border-white/20 bg-slate-950 p-5 text-white" onClick={(event) => event.stopPropagation()}>
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
          <div className="sticky top-0 z-30 mb-6 space-y-4 rounded-[30px] bg-[rgba(244,239,231,0.78)] py-2 backdrop-blur-xl">
            <div className="app-card flex flex-col gap-4 rounded-[28px] px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3">
                <button className="rounded-2xl border border-white/70 bg-white/85 p-3 text-slate-700 lg:hidden" onClick={() => setOpen(true)}>
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Current section</p>
                  <h2 className="font-serif text-2xl font-semibold sm:text-3xl">{current?.label ?? "RelocateGH"}</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <Badge tone="accent">Mock data</Badge>
                <Button variant="secondary" className="w-full sm:w-auto">Invite adviser</Button>
              </div>
            </div>

            <div className="app-card rounded-[28px] px-4 py-4 md:px-6">
              <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr,1fr,1fr]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Move date countdown</span>
                    <span className="text-sm text-slate-500">{getDaysRemaining()} days left</span>
                  </div>
                  <Progress value={progress} />
                  <p className="mt-3 text-sm text-slate-600">Overall progress is {progress}% with housing mostly settled and documents still driving urgency.</p>
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
                  <p className="mt-2 text-3xl font-semibold">18 Aug</p>
                  <p className="text-sm text-slate-500">Accra arrival with school onboarding already scheduled.</p>
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
