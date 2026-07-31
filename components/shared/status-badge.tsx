import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-sky-200 bg-sky-50 text-sky-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-orange-200 bg-orange-50 text-orange-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-600",
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  suspended: "border-rose-200 bg-rose-50 text-rose-700",
  past_due: "border-amber-200 bg-amber-50 text-amber-700",
  canceled: "border-rose-200 bg-rose-50 text-rose-700",
  free: "border-slate-200 bg-slate-50 text-slate-600",
  pro: "border-teal-200 bg-teal-50 text-teal-700",
  premium: "border-indigo-200 bg-indigo-50 text-indigo-700",
  admin: "border-indigo-200 bg-indigo-50 text-indigo-700",
  business: "border-teal-200 bg-teal-50 text-teal-700",
  customer: "border-sky-200 bg-sky-50 text-sky-700",
  appointment: "border-teal-200 bg-teal-50 text-teal-700",
  reminder: "border-amber-200 bg-amber-50 text-amber-700",
  system: "border-slate-200 bg-slate-50 text-slate-600",
  flagged: "border-amber-200 bg-amber-50 text-amber-700",
  removed: "border-rose-200 bg-rose-50 text-rose-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  banned: "border-rose-200 bg-rose-50 text-rose-700"
};

const labels: Record<string, string> = {
  active: "Active",
  rejected: "Rejetée",
  paused: "En pause",
  draft: "Brouillon",
  sold: "Vendue",
  expired: "Expirée",
  inactive: "Inactive",
  banned: "Banni",
  pending: "En attente",
  resolved: "Résolu",
  dismissed: "Ignoré"
};

export function StatusBadge({ value }: { value: string }) {
  const norm = value.toLowerCase();
  const label = labels[norm] || value;
  return <Badge className={cn("capitalize font-semibold", styles[norm] ?? styles.inactive)}>{label}</Badge>;
}
