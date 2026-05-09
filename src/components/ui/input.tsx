import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[var(--accent)] focus:bg-[var(--surface-strong)]",
        props.className,
      )}
    />
  );
}
