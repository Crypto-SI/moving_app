"use client";

import { notFound } from "next/navigation";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { useDocuments, useFamilyMembers, useHealthcareEntries } from "@/lib/data-hooks";
import { formatDate } from "@/lib/utils";

export default function FamilyMemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: familyMembers } = useFamilyMembers();
  const { data: documents } = useDocuments();
  const { data: healthcareEntries } = useHealthcareEntries();

  const member = familyMembers.find((item) => item.id === id);

  if (!member) {
    notFound();
  }

  const memberDocuments = documents.filter((item) => item.family_member_id === id);
  const memberHealthcare = healthcareEntries.filter((item) => item.family_member_id === id);

  return (
    <div className="space-y-6">
      <PageHeader title={member.full_name} description="Member profile view tying together personal details, document readiness, and healthcare planning." actionLabel="Edit profile" />

      <section className="grid gap-6 xl:grid-cols-[0.85fr,1.15fr]">
        <Card>
          <CardTitle title="Profile summary" subtitle="Personal details and photo." />
          <div className="flex items-center gap-4 mb-4">
            {member.profile_photo_url ? (
              <img
                src={member.profile_photo_url}
                alt={member.full_name}
                className="h-20 w-20 rounded-full object-cover border-2 border-white/70"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-2xl font-semibold">
                {member.full_name.charAt(0)}
              </div>
            )}
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-900">Relationship:</span> {member.relationship}</p>
            <p><span className="font-semibold text-slate-900">Date of birth:</span> {formatDate(member.date_of_birth)}</p>
            <p><span className="font-semibold text-slate-900">Notes:</span> {member.notes}</p>
          </div>
        </Card>

        <Card>
          <CardTitle title="Linked documents" subtitle="Document readiness for this family member." />
          <div className="space-y-3">
            {memberDocuments.map((item) => (
              <div key={item.id} className="rounded-3xl border border-white/70 bg-white/75 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900 capitalize">{item.document_type}</p>
                  <Badge tone={item.status === "approved" ? "success" : item.status === "expired" ? "danger" : item.status === "in progress" ? "warning" : "accent"}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">Issue {formatDate(item.issue_date)} • Expiry {formatDate(item.expiry_date)} • Ref {item.reference_number}</p>
                <p className="mt-1 text-sm text-slate-500">Original: {item.original_available ? "Yes" : "No"} • Copy: {item.copy_available ? "Yes" : "No"}</p>
              </div>
            ))}
            {memberDocuments.length === 0 && (
              <p className="text-sm text-slate-500">No documents tracked yet. Visit the Documents page to auto-generate required documents.</p>
            )}
          </div>
        </Card>
      </section>

      <Card>
        <CardTitle title="Healthcare links" subtitle="Providers associated with this family member." />
        <div className="grid gap-4 lg:grid-cols-2">
          {memberHealthcare.map((item) => (
            <div key={item.id} className="rounded-3xl border border-white/70 bg-white/75 p-4">
              <p className="font-semibold text-slate-900">{item.doctor_name}</p>
              <p className="mt-2 text-sm text-slate-600">{item.address}</p>
              <p className="mt-2 text-sm text-slate-500">{item.contact_details}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
