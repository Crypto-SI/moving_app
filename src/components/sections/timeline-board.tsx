"use client";

import { useState } from "react";
import { familyMembers, timelineTasks } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const modes = ["List", "Kanban", "Timeline"] as const;
const columns = ["not started", "in progress", "blocked", "done"] as const;

export function TimelineBoard() {
  const [mode, setMode] = useState<(typeof modes)[number]>("List");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === item ? "bg-slate-900 text-white" : "bg-white/80 text-slate-600 hover:bg-white"}`}
            onClick={() => setMode(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {mode === "List" ? (
        <Card>
          <CardTitle title="Critical path list" subtitle="Due dates, ownership, priority, and notes in one scroll-friendly view." />
          <div className="space-y-3">
            {timelineTasks.map((task) => (
              <div key={task.id} className="rounded-3xl border border-white/70 bg-white/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{task.title}</h4>
                      <Badge tone={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "neutral"}>{task.priority}</Badge>
                      <Badge tone={task.status === "done" ? "success" : task.status === "blocked" ? "danger" : "accent"}>{task.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{task.category} • Due {formatDate(task.due_date)} • Assigned to {familyMembers.find((person) => person.id === task.assigned_family_member_id)?.full_name ?? "Whole family"}</p>
                  </div>
                  <p className="max-w-lg text-sm text-slate-600">{task.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {mode === "Kanban" ? (
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <Card key={column} className="p-4">
              <CardTitle title={column} subtitle={`${timelineTasks.filter((task) => task.status === column).length} tasks`} />
              <div className="space-y-3">
                {timelineTasks.filter((task) => task.status === column).map((task) => (
                  <div key={task.id} className="rounded-3xl border border-white/70 bg-white/75 p-4">
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatDate(task.due_date)}</p>
                    <p className="mt-3 text-sm text-slate-600">{task.notes}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {mode === "Timeline" ? (
        <Card>
          <CardTitle title="Milestone timeline" subtitle="Major relocation checkpoints arranged chronologically." />
          <div className="space-y-5">
            {timelineTasks
              .slice()
              .sort((a, b) => +new Date(a.due_date) - +new Date(b.due_date))
              .map((task) => (
                <div key={task.id} className="grid gap-4 md:grid-cols-[130px,1fr]">
                  <div className="text-sm font-semibold text-slate-500">{formatDate(task.due_date)}</div>
                  <div className="relative rounded-3xl border border-white/70 bg-white/75 p-4 before:absolute before:-left-6 before:top-7 before:h-3 before:w-3 before:rounded-full before:bg-teal-500">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{task.title}</h4>
                      <Badge tone={task.status === "done" ? "success" : "accent"}>{task.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{task.notes}</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
