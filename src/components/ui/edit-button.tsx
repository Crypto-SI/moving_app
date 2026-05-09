import { Pencil } from "lucide-react";

export function EditButton<T>({
  item,
  onEdit,
  title = "Edit",
}: {
  item: T;
  onEdit: (item: T) => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onEdit(item)}
      className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 transition"
      title={title}
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}
