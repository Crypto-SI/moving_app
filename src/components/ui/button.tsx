import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-w-0 items-center justify-center rounded-full px-4 py-2 text-center text-sm font-semibold leading-5 transition duration-200 cursor-pointer",
        variant === "primary" && "bg-[var(--foreground)] text-white hover:bg-slate-700 dark:hover:bg-slate-500",
        variant === "secondary" && "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-strong)]",
        variant === "ghost" && "text-[var(--muted)] hover:bg-white/70 dark:hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
