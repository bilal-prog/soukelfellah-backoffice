"use client";

import { Plus, Edit2, Trash2, MapPin, Check, X, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { LocationReference } from "@/lib/types";

export function AdminLocationsClient() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<"region" | "province" | "commune" | "village">("region");
  const [filterParentId, setFilterParentId] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Form states for creating a new location
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"region" | "province" | "commune" | "village">("region");
  const [newParentId, setNewParentId] = useState("");
  const [newLng, setNewLng] = useState("");
  const [newLat, setNewLat] = useState("");

  // Editing state for updating an existing location
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLng, setEditLng] = useState("");
  const [editLat, setEditLat] = useState("");

  // Fetch all locations (includeInactive=true for administrative management)
  const { data: locationsRes, isLoading } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ success: boolean; data: LocationReference[] }>(
        "/locations",
        { params: { includeInactive: "true" } }
      );
      return data;
    },
  });

  const allLocations = locationsRes?.data ?? [];

  // Derived parents list for dropdown selections depending on chosen node type
  const regions = useMemo(() => allLocations.filter((l) => l.type === "region"), [allLocations]);
  const provinces = useMemo(() => allLocations.filter((l) => l.type === "province"), [allLocations]);
  const communes = useMemo(() => allLocations.filter((l) => l.type === "commune"), [allLocations]);

  // Determine potential parents for the creation form
  const potentialParents = useMemo(() => {
    if (newType === "province") return regions;
    if (newType === "commune") return provinces;
    if (newType === "village") return communes;
    return [];
  }, [newType, regions, provinces, communes]);

  // Derived parent options for the filter dropdown based on active filter type
  const filterParents = useMemo(() => {
    if (filterType === "province") return regions;
    if (filterType === "commune") return provinces;
    if (filterType === "village") return communes;
    return [];
  }, [filterType, regions, provinces, communes]);

  // Filter and search locations list to display in Table
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      const matchesType = loc.type === filterType;
      const parentObjId = typeof loc.parentId === "object" ? loc.parentId?._id : loc.parentId;
      const matchesParent = filterParentId === "all" || parentObjId === filterParentId;
      const matchesSearch = loc.name.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesParent && matchesSearch;
    });
  }, [allLocations, filterType, filterParentId, search]);

  // Create location mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => clientApi.post("/locations", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Localisation ajoutée avec succès");
      setNewName("");
      setNewParentId("");
      setNewLng("");
      setNewLat("");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de créer la localisation",
      );
    },
  });

  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      clientApi.put(`/locations/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Localisation mise à jour");
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

  // Delete location mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/locations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      toast.success("Localisation supprimée");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de supprimer (contient probablement des sous-localisations)",
      );
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Veuillez entrer le nom de la localisation");
      return;
    }

    const payload: any = {
      name: newName.trim(),
      type: newType,
    };

    if (newType !== "region") {
      if (!newParentId) {
        toast.error("Veuillez sélectionner la localisation parente");
        return;
      }
      payload.parentId = newParentId;
    }

    if (newLng || newLat) {
      const lng = parseFloat(newLng);
      const lat = parseFloat(newLat);
      if (isNaN(lng) || isNaN(lat)) {
        toast.error("Coordonnées géographiques invalides");
        return;
      }
      payload.coordinates = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    createMutation.mutate(payload);
  };

  const startEditing = (loc: LocationReference) => {
    setEditingId(loc._id);
    setEditName(loc.name);
    if (loc.coordinates?.coordinates) {
      setEditLng(loc.coordinates.coordinates[0].toString());
      setEditLat(loc.coordinates.coordinates[1].toString());
    } else {
      setEditLng("");
      setEditLat("");
    }
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) {
      toast.error("Veuillez entrer le nom de la localisation");
      return;
    }

    const payload: any = {
      name: editName.trim(),
    };

    if (editLng || editLat) {
      const lng = parseFloat(editLng);
      const lat = parseFloat(editLat);
      if (isNaN(lng) || isNaN(lat)) {
        toast.error("Coordonnées géographiques invalides");
        return;
      }
      payload.coordinates = {
        type: "Point",
        coordinates: [lng, lat],
      };
    } else {
      payload.coordinates = null;
    }

    updateMutation.mutate({ id, payload });
  };

  const toggleActive = (loc: LocationReference) => {
    updateMutation.mutate({
      id: loc._id,
      payload: { isActive: !loc.isActive },
    });
  };

  if (isLoading) return <LoadingState label="Chargement du répertoire géographique..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Creation form on left */}
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Ajouter une localisation</span>
          </CardTitle>
          <CardDescription>Ajoutez des régions, provinces, communes ou villages au réseau.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="node-name">Nom de la localisation (Arabe/Français)</Label>
              <Input
                id="node-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Région Rabat-Salé-Kénitra"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="node-type">Niveau de division</Label>
              <Select
                value={newType}
                onValueChange={(val: any) => {
                  setNewType(val);
                  setNewParentId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="region">Région</SelectItem>
                  <SelectItem value="province">Province / Préfecture</SelectItem>
                  <SelectItem value="commune">Commune</SelectItem>
                  <SelectItem value="village">Douar / Village</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newType !== "region" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="node-parent">Localisation parente</Label>
                <Select value={newParentId} onValueChange={setNewParentId}>
                  <SelectTrigger id="node-parent">
                    <SelectValue placeholder="Choisir le parent..." />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] max-h-56">
                    {potentialParents.map((parent) => (
                      <SelectItem key={parent._id} value={parent._id}>
                        {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="node-lng">Longitude (Long)</Label>
                <Input
                  id="node-lng"
                  placeholder="-5.281"
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="node-lat">Latitude (Lat)</Label>
                <Input
                  id="node-lat"
                  placeholder="35.452"
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold gap-1.5 mt-2"
              disabled={createMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              <span>Créer la localisation</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Directory structure on right */}
      <Card className="lg:col-span-2 border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Répertoire géographique</CardTitle>
          <CardDescription>Gérez l'arborescence des localisations marocaines de la plateforme.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtering controls */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={filterType}
              onValueChange={(val: any) => {
                setFilterType(val);
                setFilterParentId("all");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="region">Régions</SelectItem>
                <SelectItem value="province">Provinces</SelectItem>
                <SelectItem value="commune">Communes</SelectItem>
                <SelectItem value="village">Douars / Villages</SelectItem>
              </SelectContent>
            </Select>

            {filterType !== "region" && (
              <Select value={filterParentId} onValueChange={setFilterParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par parent..." />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-56">
                  <SelectItem value="all">Tous les parents</SelectItem>
                  {filterParents.map((parent) => (
                    <SelectItem key={parent._id} value={parent._id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Locations list */}
          {filteredLocations.length ? (
            <DataTable headers={["Nom", "Parent", "Coordonnées (Long, Lat)", "Statut", "Actions"]}>
              {filteredLocations.map((loc) => {
                const isEditing = editingId === loc._id;
                const parentName = typeof loc.parentId === "object" ? (loc.parentId as any)?.name : "-";
                const coordsLabel = loc.coordinates?.coordinates
                  ? `[${loc.coordinates.coordinates[0]}, ${loc.coordinates.coordinates[1]}]`
                  : "Aucune";

                return (
                  <tr key={loc._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8 py-1 max-w-[150px]"
                        />
                      ) : (
                        <span className="font-semibold text-foreground">{loc.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{parentName}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground text-left" dir="ltr">
                      {isEditing ? (
                        <div className="flex gap-1 max-w-[150px]">
                          <Input
                            placeholder="Long"
                            value={editLng}
                            onChange={(e) => setEditLng(e.target.value)}
                            className="h-8 py-0.5 text-xs px-1"
                          />
                          <Input
                            placeholder="Lat"
                            value={editLat}
                            onChange={(e) => setEditLat(e.target.value)}
                            className="h-8 py-0.5 text-xs px-1"
                          />
                        </div>
                      ) : (
                        coordsLabel
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={loc.isActive ? "active" : "inactive"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-500 border-emerald-200"
                              disabled={updateMutation.isPending}
                              onClick={() => handleUpdate(loc._id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-primary hover:bg-primary/10 border-input"
                              title="Modifier"
                              onClick={() => startEditing(loc)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-xs font-medium"
                              onClick={() => toggleActive(loc)}
                              disabled={updateMutation.isPending}
                            >
                              {loc.isActive ? "Désactiver" : "Activer"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                              title="Supprimer"
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                if (
                                  confirm(
                                    `Voulez-vous vraiment supprimer la localisation "${loc.name}" ?`
                                  )
                                ) {
                                  deleteMutation.mutate(loc._id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
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
              title="Répertoire vide"
              description="Aucune localisation ne correspond aux critères de filtre."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
