"use client";

import {
  Ban,
  CheckCircle,
  Search,
  UserCheck,
  ShieldAlert,
  Phone,
  KeyRound,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { UsersResponse } from "@/lib/types";

import { useDebounce } from "@/hooks/use-debounce";

const PAGE_SIZE = 10;

export function AdminUsersClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 500);

  const [selectedUserForReset, setSelectedUserForReset] = useState<{
    id: string;
    name: string;
    phone: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleGeneratePassword = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setNewPassword(randomPin);
    toast.info(`Mot de passe généré : ${randomPin}`);
  };

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      toast.success("Mot de passe copié dans le presse-papier !");
    }
  };

  // Fetch users with filters
  const { data: usersRes, isLoading } = useQuery({
    queryKey: ["admin-users", page, debouncedSearch, role],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("page", page.toString());
      if (debouncedSearch.trim())
        params.append("search", debouncedSearch.trim());
      if (role !== "all") params.append("role", role);

      const { data } = await clientApi.get<UsersResponse>("/users", { params });
      return data;
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => clientApi.put(`/users/${userId}/reset-password`, { newPassword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Mot de passe réinitialisé avec succès");
      setSelectedUserForReset(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de réinitialiser le mot de passe",
      );
    },
  });

  // Ban user mutation
  const banMutation = useMutation({
    mutationFn: async (userId: string) =>
      clientApi.post(`/users/${userId}/ban`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Utilisateur banni avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de bannir l'utilisateur",
      );
    },
  });

  // Activate user mutation
  const activateMutation = useMutation({
    mutationFn: async (userId: string) =>
      clientApi.post(`/users/${userId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Compte activé avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible d'activer le compte",
      );
    },
  });

  const handlePageChange = (newOffset: number) => {
    const newPage = Math.floor(newOffset / PAGE_SIZE) + 1;
    setPage(newPage);
  };

  const usersList = usersRes?.data ?? [];
  const meta = usersRes?.meta
    ? {
        total: usersRes.meta.total,
        limit: PAGE_SIZE,
        offset: (usersRes.meta.page - 1) * PAGE_SIZE,
      }
    : undefined;

  if (isLoading) return <LoadingState label="Chargement des utilisateurs..." />;

  return (
    <div className="space-y-4">
      {/* Filtering Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher par nom ou téléphone..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1); // Reset page to 1 on new search
            }}
          />
        </div>
        <Select
          value={role}
          onValueChange={(val) => {
            setRole(val);
            setPage(1); // Reset page to 1 on filter
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="user">Utilisateur (Fellah)</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users DataTable */}
      {usersList.length ? (
        <DataTable
          headers={[
            "Nom Complet",
            "Rôle",
            "Téléphone",
            "WhatsApp",
            "Statut",
            "Actions",
          ]}
          pagination={meta}
          onPageChange={handlePageChange}
        >
          {usersList.map((userItem) => {
            const isBanned = !userItem.isActive;

            return (
              <tr
                key={userItem._id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">
                      {userItem.firstName} {userItem.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ID: {userItem._id}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-medium ${userItem.role === "admin" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300" : "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"}`}
                  >
                    {userItem.role === "admin" ? "Admin" : "Fellah"}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-sm font-mono text-muted-foreground text-left"
                  dir="ltr"
                >
                  {userItem.phone}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-left" dir="ltr">
                  {userItem.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${userItem.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 justify-start"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{userItem.whatsappNumber}</span>
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    value={userItem.isActive ? "active" : "banned"}
                  />
                </td>
                <td className="px-4 py-3">
                  {userItem.role !== "admin" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 hover:bg-primary hover:text-white border-primary/20 text-primary"
                        onClick={() =>
                          setSelectedUserForReset({
                            id: userItem._id,
                            name: `${userItem.firstName} ${userItem.lastName}`,
                            phone: userItem.phone,
                          })
                        }
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Changer mot de passe</span>
                      </Button>

                      {isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 hover:bg-emerald-500 hover:text-white border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400"
                          disabled={activateMutation.isPending}
                          onClick={() => activateMutation.mutate(userItem._id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Réactiver</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 hover:bg-destructive hover:text-white border-destructive/20 text-destructive"
                          disabled={banMutation.isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Voulez-vous vraiment bannir ${userItem.firstName} ${userItem.lastName} ?`,
                              )
                            ) {
                              banMutation.mutate(userItem._id);
                            }
                          }}
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Bannir</span>
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : (
        <EmptyState
          title="Aucun utilisateur trouvé"
          description="Aucun compte ne correspond à votre recherche ou filtre."
        />
      )}

      {/* Password Reset Dialog Modal */}
      <Dialog
        open={Boolean(selectedUserForReset)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUserForReset(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pt-1">
              <span>
                Compte : <strong>{selectedUserForReset?.name}</strong> ({selectedUserForReset?.phone})
              </span>
              {selectedUserForReset?.phone && (
                <a
                  href={`https://wa.me/${selectedUserForReset.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md w-fit"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Ouvrir WhatsApp</span>
                </a>
              )}
            </DialogDescription>
          </DialogHeader>


          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedUserForReset && newPassword.length >= 6) {
                resetPasswordMutation.mutate({
                  userId: selectedUserForReset.id,
                  newPassword,
                });
              }
            }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-password">
                  Nouveau mot de passe (min. 6 caractères)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  onClick={handleGeneratePassword}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Générer un PIN</span>
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  id="new-password"
                  type="text"
                  placeholder="Ex: 583921"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="font-mono text-base"
                />
                {Boolean(newPassword) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title="Copier le mot de passe"
                    onClick={handleCopyPassword}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedUserForReset(null);
                  setNewPassword("");
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  resetPasswordMutation.isPending || newPassword.length < 6
                }
              >
                {resetPasswordMutation.isPending
                  ? "Modification..."
                  : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
