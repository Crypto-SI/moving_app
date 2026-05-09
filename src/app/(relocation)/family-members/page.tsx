"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AddFamilyMemberModal } from "@/components/sections/add-family-member-modal";
import { FamilyMemberPhotoModal } from "@/components/sections/family-member-photo-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useFamilyMembers, useHealthcareEntries, useDocuments } from "@/lib/data-hooks";
import { formatDate } from "@/lib/utils";
import type { FamilyMember } from "@/lib/types";

export default function FamilyMembersPage() {
  const { data: familyMembers, refresh: refreshFamilyMembers } = useFamilyMembers();
  const { data: healthcareEntries } = useHealthcareEntries();
  const { data: documents } = useDocuments();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Members"
        description="Each member acts as a central record that can later connect directly to documents, schooling, healthcare, and budget items."
        actions={
          <AddFamilyMemberModal onSuccess={refreshFamilyMembers} />
        }
      />

      <Card>
        <CardTitle title="Family list" subtitle="Responsive card-based list with profile access for every member." />
        <div className="grid gap-4 lg:grid-cols-2">
          {familyMembers.map((member) => (
            <Link key={member.id} href={`/family-members/${member.id}`} className="rounded-[28px] border border-[var(--border)] bg-white/80 dark:bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white dark:hover:bg-[var(--surface-strong)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMember(member); }}
                    className="shrink-0 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    {member.profile_photo_url ? (
                      <Image
                        src={member.profile_photo_url}
                        alt={member.full_name}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 rounded-full object-cover border-2 border-[var(--border)]"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10">
                        <User className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
                      </div>
                    )}
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">{member.full_name}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">{member.relationship}{member.date_of_birth ? ` • Born ${formatDate(member.date_of_birth)}` : ""}</p>
                  </div>
                </div>
                <Badge tone="accent">{documents.filter((doc) => doc.family_member_id === member.id).length} docs</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{member.notes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="neutral">{healthcareEntries.filter((entry) => entry.family_member_id === member.id).length} healthcare links</Badge>
                <Badge tone="success">Profile ready</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {selectedMember ? (
        <FamilyMemberPhotoModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onUpdated={refreshFamilyMembers}
          onDeleted={refreshFamilyMembers}
        />
      ) : null}
    </div>
  );
}
