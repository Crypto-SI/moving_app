"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderModal } from "@/components/sections/placeholder-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useFamilyMembers, useHealthcareEntries, useDocuments } from "@/lib/data-hooks";
import { formatDate } from "@/lib/utils";

export default function FamilyMembersPage() {
  const { data: familyMembers } = useFamilyMembers();
  const { data: healthcareEntries } = useHealthcareEntries();
  const { data: documents } = useDocuments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Members"
        description="Each member acts as a central record that can later connect directly to documents, schooling, healthcare, and assigned timeline tasks."
        actions={
          <PlaceholderModal
            title="Add family member"
            description="This modal stands in for the future create-member flow. It will later map to inserts on `relocategh_family_members` and related linking tables."
            actionLabel="Add family member"
          />
        }
      />

      <Card>
        <CardTitle title="Family list" subtitle="Responsive card-based list with profile access for every member." />
        <div className="grid gap-4 lg:grid-cols-2">
          {familyMembers.map((member) => (
            <Link key={member.id} href={`/family-members/${member.id}`} className="rounded-[28px] border border-white/70 bg-white/80 p-5 transition hover:-translate-y-1 hover:bg-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{member.full_name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{member.relationship} • Born {formatDate(member.date_of_birth)}</p>
                </div>
                <Badge tone="accent">{documents.filter((doc) => doc.family_member_id === member.id).length} docs</Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{member.notes}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="neutral">{healthcareEntries.filter((entry) => entry.family_member_id === member.id).length} healthcare links</Badge>
                <Badge tone="success">Profile ready</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
