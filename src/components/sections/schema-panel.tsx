import { databaseTableSchemas } from "@/lib/database-schema";
import { Card, CardTitle } from "@/components/ui/card";

export function SchemaPanel() {
  return (
    <Card>
      <CardTitle
        title="Future Supabase table map"
        subtitle="Unique table names are defined now so frontend state and later row-level CRUD can line up cleanly."
      />
      <div className="space-y-4">
        {databaseTableSchemas.map((schema) => (
          <div key={schema.table} className="rounded-3xl border border-white/70 bg-white/75 p-4">
            <p className="font-mono text-sm font-semibold text-slate-900">{schema.table}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{schema.columns.join(" • ")}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
