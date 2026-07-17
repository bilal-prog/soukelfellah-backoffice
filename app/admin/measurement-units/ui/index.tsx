"use client";

import { Plus, Check, X, Search, Scale, Edit2, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { MeasurementUnit } from "@/lib/types";

export function AdminUnitsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Form states for creating a new unit
  const [newName, setNewName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);

  // Editing state for updating an existing unit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // Fetch all measurement units (includeInactive=true for administrative management)
  const { data: unitsRes, isLoading } = useQuery({
    queryKey: ["admin-units"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ success: boolean; data: MeasurementUnit[] }>(
        "/measurement-units",
        { params: { includeInactive: "true" } }
      );
      return data;
    },
  });

  const units = unitsRes?.data ?? [];

  // Filter units by search query
  const filteredUnits = useMemo(() => {
    return units.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  // Create unit mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => clientApi.post("/measurement-units", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      toast.success("Unité de mesure ajoutée avec succès");
      setNewName("");
      setNewIsActive(true);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de créer l'unité de mesure"
      );
    },
  });

  // Update unit mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      clientApi.put(`/measurement-units/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      toast.success("Unité de mesure mise à jour");
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de mettre à jour l'unité"
      );
    },
  });

  // Delete unit mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/measurement-units/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      toast.success("Unité de mesure supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de supprimer l'unité"
      );
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Veuillez entrer le nom de l'unité de mesure");
      return;
    }

    createMutation.mutate({
      name: newName.trim(),
      darijaName: newName.trim(), // Keep darijaName identical for API compatibility
      isActive: newIsActive,
    });
  };

  const startEdit = (unit: MeasurementUnit) => {
    setEditingId(unit._id);
    setEditName(unit.name);
    setEditIsActive(unit.isActive);
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }

    updateMutation.mutate({
      id,
      payload: {
        name: editName.trim(),
        darijaName: editName.trim(),
        isActive: editIsActive,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette unité de mesure ?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingState label="Chargement des unités de mesure..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left side: List Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher une unité de mesure..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredUnits.length ? (
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <DataTable headers={["Nom de l'unité (Arabe/Darija)", "Statut", "Actions"]}>
                {filteredUnits.map((u) => {
                  const isEditing = editingId === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {isEditing ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 max-w-[200px]"
                          />
                        ) : (
                          u.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <select
                            value={editIsActive ? "true" : "false"}
                            onChange={(e) => setEditIsActive(e.target.value === "true")}
                            className="h-8 rounded border bg-background px-2 text-xs"
                          >
                            <option value="true">Actif</option>
                            <option value="false">Inactif</option>
                          </select>
                        ) : (
                          <StatusBadge value={u.isActive ? "active" : "inactive"} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                              onClick={() => handleUpdate(u._id)}
                              disabled={updateMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-500 hover:text-white"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(u)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-white hover:bg-red-500"
                              onClick={() => handleDelete(u._id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </DataTable>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="Aucune unité de mesure"
            description="Aucune unité ne correspond à vos critères de recherche."
          />
        )}
      </div>

      {/* Right side: Add Form */}
      <div>
        <Card className="border shadow-sm sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Nouvelle Unité
            </CardTitle>
            <CardDescription>Ajouter une unité de mesure de vente (poids, surface, etc.).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom de l'unité (Arabe/Darija)</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: كيلو, طون, صندوق, حبة"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="active"
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(e) => setNewIsActive(e.target.checked)}
                  className="rounded border bg-background"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Activer immédiatement sur le marché
                </Label>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer l'unité
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
