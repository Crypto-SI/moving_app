import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  accent: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-left text-xs font-semibold leading-4 whitespace-normal", toneMap[tone], className)}>
      {children}
    </span>
  );
}
