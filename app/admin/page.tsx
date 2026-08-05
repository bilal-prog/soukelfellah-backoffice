import { AlertTriangle, Sprout, ShoppingBag, Users, ArrowRight, Eye, Phone, MessageSquare, Activity } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, getListings, getServerUser } from "@/lib/api";
import { AppShell } from "@/components/shell/app-shell";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";

export default async function AdminDashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/login");

  const stats = await getAdminStats().catch(() => ({
    totalUsers: 0,
    totalListings: 0,
    totalActiveListings: 0,
    totalReports: 0,
    totalViews: 0,
    totalCalls: 0,
    totalMessages: 0,
  }));

  const listingsRes = await getListings(
    new URLSearchParams({ limit: "5", offset: "0" })
  ).catch(() => null);

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-emerald-400 to-transparent pointer-events-none" />
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Bienvenue, {user.firstName} {user.lastName} 👋
            </h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base leading-relaxed">
              Ceci est votre espace d'administration Souk El Fellah. Surveillez l'activité des utilisateurs, modérez les annonces de matériel ou de récoltes, traitez les signalements et gérez les versions de l'application.
            </p>
          </div>
        </div>

        {/* Stats Grid - General Metrics */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Aperçu Général
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Utilisateurs inscrits" value={stats.totalUsers} icon={Users} />
            <StatCard title="Annonces créées" value={stats.totalListings} icon={ShoppingBag} />
            <StatCard title="Annonces actives" value={stats.totalActiveListings} icon={Sprout} />
            <StatCard title="Signalements en cours" value={stats.totalReports} icon={AlertTriangle} />
          </div>
        </section>

        {/* Stats Grid - Engagement & Platform KPIs */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Engagements & Interactions (KPIs)
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Total Vues des Annonces" value={stats.totalViews ?? 0} icon={Eye} />
            <StatCard title="Total Appels Vendeurs" value={stats.totalCalls ?? 0} icon={Phone} />
            <StatCard title="Total Messages / Discutés" value={stats.totalMessages ?? 0} icon={MessageSquare} />
          </div>
        </section>

        {/* Recent Listings Table */}
        <section className="grid gap-4">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-bold">Annonces Récentes</CardTitle>
                <CardDescription>Les 5 dernières annonces publiées sur le marché et leur performance.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                <Link href="/admin/listings">
                  <span>Toutes les annonces</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {listingsRes?.data?.length ? (
                <DataTable headers={["Titre", "Catégorie", "Prix", "Vendeur", "KPIs (Vues/Appels/Msgs)", "Statut", "Date de publication"]}>
                  {listingsRes.data.map((listing) => {
                    const sellerUser = listing.sellerId;
                    const sellerName = typeof sellerUser === "object" && sellerUser
                      ? `${sellerUser.firstName} ${sellerUser.lastName}`
                      : "-";
                    const formattedDate = new Date(listing.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={listing._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{listing.title}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {typeof listing.categoryId === "object" ? listing.categoryId.name : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          {listing.price} DH
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{sellerName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50 font-medium" title="Vues">
                              <Eye className="h-3 w-3 text-sky-500" />
                              {listing.viewsCount ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50 font-medium" title="Appels">
                              <Phone className="h-3 w-3 text-emerald-500" />
                              {listing.callsCount ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 font-medium" title="Messages">
                              <MessageSquare className="h-3 w-3 text-indigo-500" />
                              {listing.messagesCount ?? 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge value={listing.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formattedDate}</td>
                      </tr>
                    );
                  })}
                </DataTable>
              ) : (
                <EmptyState
                  title="Aucune annonce trouvée"
                  description="Il n'y a pas d'annonces récemment publiées à afficher."
                />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
