import type { RelocationDocument } from "@/lib/types";

const ADULT_RELATIONSHIPS = ["Parent", "Spouse", "Sibling", "Other"];
const CHILD_RELATIONSHIPS = ["Child"];

export type RequiredDocumentType = RelocationDocument["document_type"];

export function getRequiredDocuments(relationship: string): RequiredDocumentType[] {
  if (ADULT_RELATIONSHIPS.includes(relationship)) {
    return ["birth certificate", "passport", "visa", "DBS certificate"];
  }
  if (CHILD_RELATIONSHIPS.includes(relationship)) {
    return ["birth certificate", "passport", "visa"];
  }
  return ["birth certificate", "passport"];
}

export function getMissingDocumentTypes(
  relationship: string,
  existingDocs: RelocationDocument[],
): RequiredDocumentType[] {
  const required = getRequiredDocuments(relationship);
  const existingTypes = new Set(existingDocs.map((d) => d.document_type));
  return required.filter((t) => !existingTypes.has(t));
}
