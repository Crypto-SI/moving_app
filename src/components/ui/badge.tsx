import { cn } from "@/lib/utils";

const toneMap = {
  neutral: "bg-slate-100 text-slate-700",
  accent: "bg-teal-100 text-teal-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
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
