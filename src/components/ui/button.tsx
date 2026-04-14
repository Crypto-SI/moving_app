import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition duration-200 cursor-pointer",
        variant === "primary" && "bg-[var(--foreground)] text-white hover:bg-slate-700",
        variant === "secondary" && "border border-white/60 bg-white/85 text-slate-700 hover:bg-white",
        variant === "ghost" && "text-slate-600 hover:bg-white/70",
        className,
      )}
      {...props}
    />
  );
}
