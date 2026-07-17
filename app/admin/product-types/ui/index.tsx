"use client";

import { Plus, Search, Layers, Edit2, Trash2, Check, X } from "lucide-react";
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
import type { Category, MeasurementUnit, ProductType } from "@/lib/types";

export function AdminProductTypesClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Form states for creating a new product type
  const [newName, setNewName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [newIsActive, setNewIsActive] = useState(true);

  // Editing state for updating an existing product type
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editUnitIds, setEditUnitIds] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);

  // Fetch categories (all, including inactive, for admin lookup & selection)
  const { data: categoriesRes } = useQuery({
    queryKey: ["admin-categories-lookup"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ success: boolean; data: Category[] }>(
        "/categories",
        { params: { includeInactive: "true" } }
      );
      return data;
    },
  });
  const categories = categoriesRes?.data ?? [];

  // Fetch units (all, including inactive, for admin selection)
  const { data: unitsRes } = useQuery({
    queryKey: ["admin-units-lookup"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ success: boolean; data: MeasurementUnit[] }>(
        "/measurement-units",
        { params: { includeInactive: "true" } }
      );
      return data;
    },
  });
  const units = unitsRes?.data ?? [];

  // Fetch product types
  const { data: productTypesRes, isLoading } = useQuery({
    queryKey: ["admin-product-types"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ success: boolean; data: ProductType[] }>(
        "/product-types",
        { params: { includeInactive: "true" } }
      );
      return data;
    },
  });
  const productTypes = productTypesRes?.data ?? [];

  // Filter list
  const filteredProductTypes = useMemo(() => {
    return productTypes.filter((type) => {
      const matchesSearch = type.name.toLowerCase().includes(search.toLowerCase());
      const catId = typeof type.categoryId === "object" && type.categoryId ? (type.categoryId as any)._id : type.categoryId;
      const matchesCategory = selectedCategoryFilter === "all" || catId === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [productTypes, search, selectedCategoryFilter]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => clientApi.post("/product-types", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-types"] });
      toast.success("Type de produit ajouté avec succès");
      setNewName("");
      setSelectedCategoryId("");
      setSelectedUnitIds([]);
      setNewIsActive(true);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de créer le type de produit"
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      clientApi.put(`/product-types/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-types"] });
      toast.success("Type de produit mis à jour");
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de mettre à jour le type de produit"
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/product-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-product-types"] });
      toast.success("Type de produit supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de supprimer le type de produit"
      );
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Veuillez entrer le nom du type de produit");
      return;
    }
    if (!selectedCategoryId) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    if (selectedUnitIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une unité de mesure autorisée");
      return;
    }

    createMutation.mutate({
      name: newName.trim(),
      categoryId: selectedCategoryId,
      allowedUnits: selectedUnitIds,
      isActive: newIsActive,
    });
  };

  const handleToggleUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const handleToggleEditUnit = (unitId: string) => {
    setEditUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const startEdit = (type: ProductType) => {
    setEditingId(type._id);
    setEditName(type.name);
    setEditCategoryId(typeof type.categoryId === "object" && type.categoryId ? (type.categoryId as any)._id : (type.categoryId as string));
    
    const unitIds = Array.isArray(type.allowedUnits)
      ? type.allowedUnits.map((u) => (typeof u === "object" && u ? (u as any)._id : u))
      : [];
    setEditUnitIds(unitIds);
    setEditIsActive(type.isActive ?? true);
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    if (!editCategoryId) {
      toast.error("Veuillez sélectionner une catégorie");
      return;
    }
    if (editUnitIds.length === 0) {
      toast.error("Veuillez autoriser au moins une unité");
      return;
    }

    updateMutation.mutate({
      id,
      payload: {
        name: editName.trim(),
        categoryId: editCategoryId,
        allowedUnits: editUnitIds,
        isActive: editIsActive,
      },
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type de produit ?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingState label="Chargement des types de produits..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left side: List Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher un type de produit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="rounded-md border bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {filteredProductTypes.length ? (
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <DataTable headers={["Nom (Arabe/Darija)", "Catégorie", "Unités de mesure", "Statut", "Actions"]}>
                {filteredProductTypes.map((type) => {
                  const isEditing = editingId === type._id;
                  
                  const categoryName =
                    typeof type.categoryId === "object" && type.categoryId
                      ? (type.categoryId as any).name
                      : "Inconnue";

                  const unitsLabel = Array.isArray(type.allowedUnits)
                    ? type.allowedUnits
                        .map((u) => (typeof u === "object" && u ? (u as any).name : u))
                        .join(", ")
                    : "";

                  return (
                    <tr key={type._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {isEditing ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-8 max-w-[150px]"
                          />
                        ) : (
                          type.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {isEditing ? (
                          <select
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            className="h-8 rounded border bg-background px-2 text-xs"
                          >
                            {categories.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          categoryName
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {isEditing ? (
                          <div className="border rounded p-1 space-y-1 max-h-[80px] overflow-y-auto min-w-[150px]">
                            {units.map((u) => (
                              <label key={u._id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editUnitIds.includes(u._id)}
                                  onChange={() => handleToggleEditUnit(u._id)}
                                  className="h-3.5 w-3.5 rounded border"
                                />
                                <span>{u.name}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          unitsLabel
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
                          <StatusBadge value={type.isActive ? "active" : "inactive"} />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                              onClick={() => handleUpdate(type._id)}
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
                              onClick={() => startEdit(type)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-white hover:bg-red-500"
                              onClick={() => handleDelete(type._id)}
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
            title="Aucun type de produit"
            description="Aucun type de produit ne correspond à vos filtres de recherche."
          />
        )}
      </div>

      {/* Right side: Add Form */}
      <div>
        <Card className="border shadow-sm sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              Nouveau Type
            </CardTitle>
            <CardDescription>Définir un nouveau type de culture ou marchandise.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nom du type de produit (Arabe)</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: عنب, طماطم, بطاطس, جرار"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Catégorie parente</Label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Choisir une catégorie --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Unités autorisées</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-[160px] overflow-y-auto">
                  {units.map((u) => (
                    <label key={u._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/40 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUnitIds.includes(u._id)}
                        onChange={() => handleToggleUnit(u._id)}
                        className="rounded border"
                      />
                      <span>{u.name}</span>
                    </label>
                  ))}
                </div>
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
                  Activer immédiatement
                </Label>
              </div>

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer le type de produit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
