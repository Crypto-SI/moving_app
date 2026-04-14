import { PageHeader } from "@/components/layout/page-header";
import { PlaceholderModal } from "@/components/sections/placeholder-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { documents, familyMembers } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Status chips, person filters, and reference data are already structured to map directly to future document CRUD."
        actions={
          <PlaceholderModal
            title="Add document record"
            description="Future version will create a row in `relocategh_documents` and attach uploads through Supabase Storage."
            actionLabel="Track document"
          />
        }
      />

      <Card>
        <CardTitle title="Filters" subtitle="Prototype search and filter controls for person and status." />
        <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr,1fr]">
          <Input placeholder="Search document type, reference, or note" />
          <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-500">All people</div>
          <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm text-slate-500">All statuses</div>
        </div>
      </Card>

      <Card>
        <CardTitle title="Tracked documents" subtitle="Per-person document readiness with originals, copies, and expiry visibility." />
        <div className="grid gap-3 md:hidden">
          {documents.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/70 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{familyMembers.find((person) => person.id === item.family_member_id)?.full_name}</p>
                <Badge tone={item.status === "approved" ? "success" : item.status === "expired" ? "danger" : item.status === "not started" ? "warning" : "accent"}>{item.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500 capitalize">{item.document_type}</p>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p>Issue: {formatDate(item.issue_date)}</p>
                <p>Expiry: {formatDate(item.expiry_date)}</p>
                <p>Reference: {item.reference_number}</p>
                <p>Original: {item.original_available ? "Yes" : "No"} • Copy: {item.copy_available ? "Yes" : "No"}</p>
                <p>{item.notes}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="hidden min-w-full text-left text-sm md:table">
            <thead className="text-slate-500">
              <tr>
                <th className="px-3 py-3 font-medium">Person</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Issue</th>
                <th className="px-3 py-3 font-medium">Expiry</th>
                <th className="px-3 py-3 font-medium">Reference</th>
                <th className="px-3 py-3 font-medium">Original</th>
                <th className="px-3 py-3 font-medium">Copy</th>
                <th className="px-3 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((item) => (
                <tr key={item.id} className="border-t border-white/70">
                  <td className="px-3 py-4">{familyMembers.find((person) => person.id === item.family_member_id)?.full_name}</td>
                  <td className="px-3 py-4 capitalize">{item.document_type}</td>
                  <td className="px-3 py-4">
                    <Badge tone={item.status === "approved" ? "success" : item.status === "expired" ? "danger" : item.status === "not started" ? "warning" : "accent"}>{item.status}</Badge>
                  </td>
                  <td className="px-3 py-4">{formatDate(item.issue_date)}</td>
                  <td className="px-3 py-4">{formatDate(item.expiry_date)}</td>
                  <td className="px-3 py-4">{item.reference_number}</td>
                  <td className="px-3 py-4">{item.original_available ? "Yes" : "No"}</td>
                  <td className="px-3 py-4">{item.copy_available ? "Yes" : "No"}</td>
                  <td className="px-3 py-4 text-slate-500">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
