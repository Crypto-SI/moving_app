import { getMoveIdForUser } from "@/lib/move-context";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { getMissingDocumentTypes } from "@/lib/document-requirements";
import type { FamilyMember, RelocationDocument } from "@/lib/types";

export async function ensureDocuments(
  familyMembers: FamilyMember[],
  existingDocs: RelocationDocument[],
): Promise<void> {
  const moveId = await getMoveIdForUser();
  if (!moveId) return;

  const inserts: {
    move_id: string;
    family_member_id: string;
    document_type: string;
    status: string;
  }[] = [];

  for (const member of familyMembers) {
    const memberDocs = existingDocs.filter((d) => d.family_member_id === member.id);
    const missing = getMissingDocumentTypes(member.relationship, memberDocs);
    for (const docType of missing) {
      inserts.push({
        move_id: moveId,
        family_member_id: member.id,
        document_type: docType,
        status: "not started",
      });
    }
  }

  if (inserts.length > 0) {
    const supabase = createBrowserClient();
    await supabase.from("moving_documents").insert(inserts);
  }
}
