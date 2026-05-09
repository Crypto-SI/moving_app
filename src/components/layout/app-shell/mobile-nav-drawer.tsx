"use client";

import Link from "next/link";
import { Settings, X } from "lucide-react";
import { BrandHeader } from "@/components/layout/app-shell/app-sidebar";
import { iconMap } from "@/components/layout/app-shell/nav-icons";
import { navItems } from "@/lib/navigation";

export function MobileNavDrawer({
  onClose,
  onOpenSettings,
}: {
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden" onClick={onClose}>
      <div className="h-full w-[86%] max-w-[320px] overflow-y-auto border-r border-white/20 bg-slate-950 p-5 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <BrandHeader logoSize={36} subtitle="Prototype menu" />
          <button className="rounded-full p-2 hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.href];
            return (
              <Link key={item.href} href={item.href} onClick={onClose} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
