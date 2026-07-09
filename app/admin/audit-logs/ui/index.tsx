"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { AuditLogsResponse, AuditLog } from "@/lib/types";

const PAGE_SIZE = 20;

export function AdminAuditLogsClient() {
  const [offset, setOffset] = useState(0);

  // Map offset to page number
  const page = Math.floor(offset / PAGE_SIZE) + 1;

  const { data: logsRes, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("page", page.toString());

      const { data } = await clientApi.get<AuditLogsResponse>("/audit-logs", {
        params,
      });
      return data;
    },
  });

  const logsList = logsRes?.data ?? [];
  const meta = logsRes?.meta ? {
    total: logsRes.meta.total,
    limit: PAGE_SIZE,
    offset: (logsRes.meta.page - 1) * PAGE_SIZE,
  } : undefined;

  if (isLoading) return <LoadingState label="Chargement du journal d'audit..." />;

  return (
    <div className="space-y-4">
      {logsList.length ? (
        <DataTable
          headers={[
            "Action / Opération",
            "Utilisateur responsable",
            "Type d'entité",
            "ID de l'entité",
            "Adresse IP",
            "Date & Heure",
          ]}
          pagination={meta}
          onPageChange={setOffset}
        >
          {logsList.map((log: AuditLog) => {
            const user = log.userId;
            const userName = user ? `${user.firstName} ${user.lastName}` : "-";
            const userSub = user ? user.phone : "";

            return (
              <tr key={log._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <StatusBadge value={log.action} />
                </td>
                <td className="px-4 py-3 text-sm">
                  {user ? (
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{userName}</span>
                      <span className="text-xs text-muted-foreground font-mono" dir="ltr">{userSub}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{log.entityType}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground text-left" dir="ltr">
                  {log.entityId}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground text-left" dir="ltr">
                  {log.ipAddress || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("fr-FR")}
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : (
        <EmptyState
          title="Aucune action enregistrée"
          description="Le journal d'audit est actuellement vide."
        />
      )}
    </div>
  );
}
