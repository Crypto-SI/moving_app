"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useFamilyMembers, useMiscNotes } from "@/lib/data-hooks";
import { formatDate } from "@/lib/utils";

export default function MiscellaneousNotesPage() {
  const { data: familyMembers } = useFamilyMembers();
  const { data: miscNotes } = useMiscNotes();

  return (
    <div className="space-y-6">
      <PageHeader title="Miscellaneous Notes" description="Structured notes keep relocation context useful instead of becoming a single unscannable text dump." actionLabel="Add note" />

      <Card>
        <CardTitle title="Search and filters" subtitle="Placeholder controls for later live note filtering." />
        <div className="grid gap-4 lg:grid-cols-3">
          <Input placeholder="Search title, note body, or linked section" />
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--muted)]">All categories</div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--muted)]">All priorities</div>
        </div>
      </Card>

      <div className="grid gap-4">
        {miscNotes.map((note) => (
          <Card key={note.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">{note.title}</h3>
                  <Badge tone={note.priority === "urgent" ? "danger" : note.priority === "high" ? "warning" : "accent"}>{note.priority}</Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{note.category} • Linked to {note.linked_section} • Added {formatDate(note.date_added)}</p>
              </div>
              <Badge tone="neutral">{familyMembers.find((person) => person.id === note.linked_family_member_id)?.full_name ?? "General note"}</Badge>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{note.note_body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
