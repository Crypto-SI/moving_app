import {
  Banknote,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  NotebookPen,
  Package,
  School,
  ShipWheel,
  Users,
} from "lucide-react";

export const iconMap = {
  "/dashboard": LayoutDashboard,
  "/family-members": Users,
  "/documents": FileText,
  "/shipping": ShipWheel,
  "/housing": Home,
  "/household-inventory": Package,
  "/schooling": School,
  "/healthcare": HeartPulse,
  "/budget": Banknote,
  "/miscellaneous-notes": NotebookPen,
} as const;
