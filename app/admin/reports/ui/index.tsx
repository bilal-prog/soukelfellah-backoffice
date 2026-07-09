"use client";

import { Eye, ShieldAlert, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { ReportsResponse, User } from "@/lib/types";

const PAGE_SIZE = 10;

export function AdminReportsClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch flagged reports
  const { data: reportsRes, isLoading } = useQuery({
    queryKey: ["admin-reports", page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("page", page.toString());
      const { data } = await clientApi.get<ReportsResponse>("/reports", { params });
      return data;
    },
  });

  // Update report status mutation (RESOLVED or DISMISSED)
  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "RESOLVED" | "DISMISSED" }) =>
      clientApi.patch(`/reports/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      const msg = variables.status === "RESOLVED" ? "Signalement résolu" : "Signalement ignoré";
      toast.success(msg);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de modifier le signalement",
      );
    },
  });

  // Delete reported listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async ({ listingId, reportId }: { listingId: string; reportId: string }) => {
      await clientApi.delete(`/listings/${listingId}`);
      await clientApi.patch(`/reports/${reportId}`, { status: "RESOLVED" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Annonce supprimée et signalement résolu");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de supprimer l'annonce",
      );
    },
  });

  const handlePageChange = (newOffset: number) => {
    const newPage = Math.floor(newOffset / PAGE_SIZE) + 1;
    setPage(newPage);
  };

  const reportsList = reportsRes?.data ?? [];
  const meta = reportsRes?.meta ? {
    total: reportsRes.meta.total,
    limit: PAGE_SIZE,
    offset: (reportsRes.meta.page - 1) * PAGE_SIZE,
  } : undefined;

  if (isLoading) return <LoadingState label="Chargement des signalements..." />;

  return (
    <div className="space-y-4">
      {reportsList.length ? (
        <DataTable
          headers={[
            "Annonce Signalée",
            "Raison du signalement",
            "Signalé par",
            "Auteur de l'annonce",
            "Statut du signalement",
            "Actions",
          ]}
          pagination={meta}
          onPageChange={handlePageChange}
        >
          {reportsList.map((rep) => {
            const reporter = rep.reporterId
              ? `${rep.reporterId.firstName} ${rep.reporterId.lastName}`
              : "-";
            
            const hasListing = rep.listingId && typeof rep.listingId === "object";
            const sellerUser = hasListing ? (rep.listingId.sellerId as User | string) : null;
            
            const seller = sellerUser && typeof sellerUser === "object"
              ? `${sellerUser.firstName} ${sellerUser.lastName}`
              : "-";
            const sellerPhone = sellerUser && typeof sellerUser === "object" ? sellerUser.phone : "-";
            
            const isPending = rep.status === "PENDING";

            return (
              <tr key={rep._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {hasListing ? rep.listingId.title : "[Annonce Supprimée]"}
                    </span>
                    <span className="text-xxs text-muted-foreground font-mono">
                      ID: {hasListing ? rep.listingId._id : (rep.listingId as any || "-")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  <div className="max-w-[200px] truncate" title={rep.reason}>
                    {rep.reason}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{reporter}</span>
                    <span className="text-xxs font-mono" dir="ltr">{rep.reporterId?.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{seller}</span>
                    <span className="text-xxs font-mono" dir="ltr">{sellerPhone}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={rep.status.toLowerCase()} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {isPending && hasListing && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                          title="Marquer comme Résolu (Garder l'annonce)"
                          disabled={resolveMutation.isPending}
                          onClick={() => resolveMutation.mutate({ id: rep._id, status: "RESOLVED" })}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Résoudre</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white"
                          title="Ignorer le signalement"
                          disabled={resolveMutation.isPending}
                          onClick={() => resolveMutation.mutate({ id: rep._id, status: "DISMISSED" })}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Ignorer</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                          title="Supprimer l'annonce"
                          disabled={deleteListingMutation.isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Voulez-vous vraiment supprimer l'annonce "${rep.listingId.title}" et clore ce signalement ?`
                              )
                            ) {
                              deleteListingMutation.mutate({
                                listingId: rep.listingId._id,
                                reportId: rep._id,
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Supprimer</span>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : (
        <EmptyState
          title="Aucun signalement"
          description="Aucun signalement en attente de modération."
        />
      )}
    </div>
  );
}
