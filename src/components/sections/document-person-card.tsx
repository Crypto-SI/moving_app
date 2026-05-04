"use client";

import { CheckCircle, Clock, Loader2, User } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DocumentStatusPicker } from "@/components/sections/document-status-picker";
import { cn } from "@/lib/utils";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getRequiredDocuments } from "@/lib/document-requirements";
import type { DocumentStatus, FamilyMember, RelocationDocument } from "@/lib/types";

interface Props {
  member: FamilyMember;
  documents: RelocationDocument[];
  onStatusChange: () => void;
}

function getProgressInfo(member: FamilyMember, docs: RelocationDocument[]) {
  const required = getRequiredDocuments(member.relationship);
  const ready = docs.filter((d) => d.status === "approved" || d.status === "received").length;
  return { ready, total: required.length };
}

export function DocumentPersonCard({ member, documents, onStatusChange }: Props) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const memberDocs = documents.filter((d) => d.family_member_id === member.id);
  const requiredDocs = getRequiredDocuments(member.relationship);
  const { ready, total } = getProgressInfo(member, memberDocs);

  const docByType = new Map(memberDocs.map((d) => [d.document_type, d]));
  const allComplete = ready === total;

  const handleStatusChange = useCallback(
    async (docId: string, status: DocumentStatus) => {
      setUpdatingId(docId);
      const supabase = createBrowserClient();
      await supabase.from("moving_documents").update({ status }).eq("id", docId);
      setUpdatingId(null);
      onStatusChange();
    },
    [onStatusChange],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/70 min-h-[320px]",
        "transition hover:-translate-y-1",
      )}
    >
      {member.profile_photo_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${member.profile_photo_url})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-slate-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/25" />

      <div className="relative z-10 flex flex-col h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
              {member.profile_photo_url ? (
                <img
                  src={member.profile_photo_url}
                  alt={member.full_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{member.full_name}</h3>
              <Badge tone="neutral" className="bg-white/20 text-white backdrop-blur-sm">
                {member.relationship}
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              allComplete
                ? "bg-emerald-500/30 text-emerald-200"
                : "bg-white/20 text-white backdrop-blur-sm",
            )}
          >
            {allComplete ? (
              <CheckCircle className="h-3.5 w-3.5" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            {ready}/{total} ready
          </div>
        </div>

        <div className="mt-5 flex-1 space-y-2.5">
          {requiredDocs.map((docType) => {
            const doc = docByType.get(docType);
            const status: DocumentStatus = doc?.status ?? "not started";

            return (
              <div
                key={docType}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {updatingId === doc?.id ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin shrink-0" />
                  ) : (
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        status === "approved" && "bg-emerald-400",
                        status === "received" && "bg-blue-400",
                        status === "in progress" && "bg-amber-400",
                        status === "expired" && "bg-rose-400",
                        status === "not started" && "bg-slate-400",
                      )}
                    />
                  )}
                  <span className="text-sm font-medium text-white capitalize truncate">
                    {docType}
                  </span>
                </div>

                {doc ? (
                  <DocumentStatusPicker
                    value={status}
                    onChange={(s) => handleStatusChange(doc.id, s)}
                  />
                ) : (
                  <span className="text-xs text-white/50">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
