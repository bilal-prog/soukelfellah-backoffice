"use client";

import { Plus, Edit2, Check, X, Search, List, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/file-upload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { Category } from "@/lib/types";

export function AdminCategoriesClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Form states for creating a new category
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);

  // Editing state for updating an existing category
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);

  // Fetch all categories (includeInactive=true for administrative management)
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await clientApi.get<{
        success: boolean;
        data: Category[];
      }>("/categories", { params: { includeInactive: "true" } });
      return data;
    },
  });

  const categories = categoriesRes?.data ?? [];

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [categories, search]);

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => clientApi.post("/categories", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Catégorie ajoutée avec succès");
      setNewName("");
      setNewIcon("");
      setNewIsActive(true);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de créer la catégorie",
      );
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      clientApi.put(`/categories/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Catégorie mise à jour");
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de mettre à jour",
      );
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de supprimer la catégorie"
      );
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Veuillez entrer le nom de la catégorie");
      return;
    }

    createMutation.mutate({
      name: newName.trim(),
      icon: newIcon.trim() || undefined,
      isActive: newIsActive,
    });
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditIcon(
      typeof cat.icon === "object" && cat.icon !== null
        ? (cat.icon as any)._id
        : cat.icon || ""
    );
    setEditIsActive(cat.isActive);
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
        icon: editIcon.trim() || undefined,
        isActive: editIsActive,
      },
    });
  };

  if (isLoading) return <LoadingState label="Chargement des catégories..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left side: List Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredCategories.length ? (
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <DataTable
                headers={[
                  "Nom (Darija/Arabe)",
                  "Slug",
                  "Icône",
                  "Statut",
                  "Actions",
                ]}
              >
                {filteredCategories.map((cat) => {
                  const isEditing = editingId === cat._id;
                  return (
                    <tr
                      key={cat._id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {isEditing ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 max-w-[200px]"
                          />
                        ) : (
                          cat.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="max-w-[160px]">
                            <FileUpload
                              value={editIcon}
                              onChange={(val) => setEditIcon(val)}
                              maxFiles={1}
                              helperText="JPEG/PNG max 5MB"
                            />
                          </div>
                        ) : cat.icon ? (
                          typeof cat.icon === "object" ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.icon.url}
                              className="w-10 h-10 object-contain rounded border bg-muted p-1"
                              alt=""
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/files/view/${cat.icon}`}
                              className="w-10 h-10 object-contain rounded border bg-muted p-1"
                              alt=""
                            />
                          )
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Aucune icône</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {isEditing ? (
                          <select
                            value={editIsActive ? "true" : "false"}
                            onChange={(e) =>
                              setEditIsActive(e.target.value === "true")
                            }
                            className="h-8 rounded border bg-background px-2 text-xs"
                          >
                            <option value="true">Actif</option>
                            <option value="false">Inactif</option>
                          </select>
                        ) : (
                          <StatusBadge
                            value={cat.isActive ? "active" : "inactive"}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                              onClick={() => handleUpdate(cat._id)}
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
                              onClick={() => startEdit(cat)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-white hover:bg-red-500"
                              onClick={() => handleDelete(cat._id)}
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
            title="Aucune catégorie"
            description="Aucune catégorie ne correspond à vos critères de recherche."
          />
        )}
      </div>

      {/* Right side: Add Form */}
      <div>
        <Card className="border shadow-sm sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <List className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Nouvelle Catégorie
            </CardTitle>
            <CardDescription>
              Ajouter une catégorie de produits ou matériel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom de la catégorie (Arabe)</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: فواكه, خضروات, معدات"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Icône de la catégorie</Label>
                <FileUpload
                  value={newIcon}
                  onChange={(val) => setNewIcon(val)}
                  maxFiles={1}
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
                Créer la catégorie
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
