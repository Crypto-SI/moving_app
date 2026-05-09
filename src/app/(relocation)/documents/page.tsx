"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DocumentPersonCard } from "@/components/sections/document-person-card";
import { ensureDocuments, useDocuments, useFamilyMembers } from "@/lib/data-hooks";

export default function DocumentsPage() {
  const { data: familyMembers, loading: membersLoading } = useFamilyMembers();
  const { data: documents, loading: docsLoading, refresh: refreshDocs } = useDocuments();
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const runEnsure = useCallback(async () => {
    if (familyMembers.length === 0) {
      setSeeded(true);
      return;
    }
    setSeeding(true);
    await ensureDocuments(familyMembers, documents);
    refreshDocs();
    setSeeding(false);
    setSeeded(true);
  }, [familyMembers, documents, refreshDocs]);

  const loading = membersLoading || docsLoading || seeding;

  const handleStatusChange = useCallback(() => {
    refreshDocs();
  }, [refreshDocs]);

  if (!loading && !seeded) {
    runEnsure();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Track required documents for each family member. Status changes are saved automatically."
        actions={null}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="rounded-[28px] border border-[var(--border)] bg-white/80 dark:bg-white/5 p-8 text-center">
          <p className="text-lg font-semibold text-[var(--foreground)]">No family members yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add family members first to see their required documents here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {familyMembers.map((member) => (
            <DocumentPersonCard
              key={member.id}
              member={member}
              documents={documents}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
