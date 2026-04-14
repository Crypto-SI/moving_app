import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  actionLabel = "Add placeholder",
  actions,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <Badge tone="accent" className="mb-3">RelocateGH prototype</Badge>
        <h1 className="font-serif text-4xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      <div className="w-full md:w-auto">
        {actions ?? <Button className="w-full md:w-auto">{actionLabel}</Button>}
      </div>
    </div>
  );
}
