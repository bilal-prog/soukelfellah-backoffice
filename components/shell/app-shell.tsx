"use client";

import cn from "clsx";
import {
  LayoutDashboard,
  Users,
  Sprout,
  AlertTriangle,
  MapPin,
  Bell,
  RefreshCw,
  FileText,
  LogOut,
  Menu,
  X,
  Layers,
  Scale,
  List,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { clearClientUser, saveClientUser } from "@/lib/auth";
import type { User } from "@/lib/types";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const adminNav = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/users", label: "Gestion des utilisateurs", icon: Users },
  { href: "/admin/listings", label: "Modération des annonces", icon: Sprout },
  { href: "/admin/categories", label: "Catégories", icon: List },
  { href: "/admin/measurement-units", label: "Unités de mesure", icon: Scale },
  { href: "/admin/product-types", label: "Types de produits", icon: Layers },
  { href: "/admin/reports", label: "Signalements", icon: AlertTriangle },
  { href: "/admin/locations", label: "Communes & Villes", icon: MapPin },
  { href: "/admin/notifications", label: "Campagnes Marketing", icon: Bell },
  { href: "/admin/versions", label: "Versions de l'application", icon: RefreshCw },
  { href: "/admin/audit-logs", label: "Historique des actions", icon: FileText }
];

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [open, setOpen] = useState(false);
  const nav = adminNav;
  const title = useMemo(() => nav.find((item) => item.href === pathname)?.label ?? "Souk El Fellah", [nav, pathname]);

  useEffect(() => {
    let cancelled = false;

    async function refreshUser() {
      try {
        const { data } = await clientApi.get<{ user: User }>("/me");
        if (cancelled) return;
        setCurrentUser(data.user);
        saveClientUser(data.user);
      } catch {
        return;
      }
    }

    refreshUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function logout() {
    await clientApi.post("/auth/logout").catch(() => null);
    clearClientUser();
    toast.success("Déconnexion réussie");
    router.push("/login");
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          <span className="text-base text-foreground font-bold tracking-tight">Souk El Fellah</span>
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                active && "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold"
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3 bg-muted/40">
        <div className="rounded-md bg-card border p-3 text-sm shadow-sm">
          <div className="font-semibold text-foreground">{currentUser.firstName} {currentUser.lastName}</div>
          <div className="truncate text-xs text-muted-foreground mt-0.5">{currentUser.phone}</div>
          <div className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xxs font-medium text-emerald-800 dark:text-emerald-300 mt-2">
            Administrateur
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden">
          <div className="h-full max-w-72 bg-card">{sidebar}</div>
        </div>
      ) : null}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-bold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={logout} className="gap-2 text-muted-foreground border hover:text-destructive hover:border-destructive transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6 min-h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}
