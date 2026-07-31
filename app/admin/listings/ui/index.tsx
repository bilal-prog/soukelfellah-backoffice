"use client";

import {
  CheckCircle,
  XCircle,
  PauseCircle,
  Trash2,
  Search,
  MapPin,
  Eye,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { ListingsResponse, Category, User, Listing } from "@/lib/types";

import { useDebounce } from "@/hooks/use-debounce";

const PAGE_SIZE = 10;

export function AdminListingsClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 500);

  // State to hold active previewed listing modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Fetch product categories for filtering
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ data: Category[] }>("/categories");
      return data;
    },
  });
  const categories = categoriesRes?.data ?? [];

  // Fetch listings with filters
  const { data: listingsRes, isLoading } = useQuery({
    queryKey: [
      "admin-listings",
      page,
      debouncedSearch,
      categoryId,
      type,
      status,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("page", page.toString());
      if (debouncedSearch.trim())
        params.append("search", debouncedSearch.trim());
      if (categoryId !== "all") params.append("categoryId", categoryId);
      if (type !== "all") params.append("type", type);
      if (status !== "all") params.append("status", status);

      const { data } = await clientApi.get<ListingsResponse>("/listings", {
        params,
      });
      return data;
    },
  });

  // Moderate listing mutation (approve/pause/reject)
  const moderateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "paused" | "rejected";
    }) => clientApi.put(`/listings/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      const msg =
        variables.status === "active"
          ? "Annonce approuvée (activée)"
          : variables.status === "paused"
            ? "Annonce mise en pause"
            : "Annonce rejetée";
      toast.success(msg);
      // Update modal state if active
      if (selectedListing && selectedListing._id === variables.id) {
        setSelectedListing((prev) =>
          prev ? { ...prev, status: variables.status } : null,
        );
      }
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de modérer l'annonce",
      );
    },
  });

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/listings/${id}`),
    onSuccess: (_, listingId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Annonce supprimée avec succès");
      if (selectedListing && selectedListing._id === listingId) {
        setSelectedListing(null);
      }
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

  const listingsList = listingsRes?.data ?? [];
  const meta = listingsRes?.meta
    ? {
        total: listingsRes.meta.total,
        limit: PAGE_SIZE,
        offset: (listingsRes.meta.page - 1) * PAGE_SIZE,
      }
    : undefined;

  if (isLoading) return <LoadingState label="Chargement des annonces..." />;

  return (
    <div className="space-y-4">
      {/* Filters block */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher par titre de l'annonce..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Select
          value={categoryId}
          onValueChange={(val) => {
            setCategoryId(val);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(val) => {
            setType(val);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type d'offre" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="SELL">Vente (Offre)</SelectItem>
            <SelectItem value="BUY">Achat (Demande)</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="paused">En pause</SelectItem>
            <SelectItem value="sold">Vendues</SelectItem>
            <SelectItem value="expired">Expirées</SelectItem>
            <SelectItem value="rejected">Rejetées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Table */}
      {listingsList.length ? (
        <DataTable
          headers={[
            "Visuel",
            "Offre/Produit",
            "Catégorie",
            "Prix",
            "Vendeur",
            "Province",
            "Statut",
            "Date",
            "Actions",
          ]}
          pagination={meta}
          onPageChange={handlePageChange}
        >
          {listingsList.map((listing) => {
            const sellerUser = listing.sellerId as User | string;
            const seller =
              typeof sellerUser === "object" && sellerUser
                ? `${sellerUser.firstName} ${sellerUser.lastName}`
                : "-";

            const province = listing.location?.province || "-";

            const isApproved = listing.status === "active";
            const isPaused = listing.status === "paused";
            const isRejected = listing.status === "rejected";

            // Resolve listing first image url
            const firstImg = listing.images?.[0];
            const firstImgUrl =
              typeof firstImg === "object" && firstImg
                ? firstImg.url
                : typeof firstImg === "string"
                  ? firstImg
                  : null;

            return (
              <tr
                key={listing._id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  {firstImgUrl ? (
                    <img
                      src={firstImgUrl}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover border bg-muted shadow-sm hover:scale-105 transition-transform cursor-zoom-in"
                      onClick={() => setSelectedListing(listing)}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md border border-dashed flex items-center justify-center bg-muted/40 text-muted-foreground text-[10px] font-semibold">
                      Pas d'image
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span
                      className="font-semibold text-foreground hover:underline cursor-pointer flex items-center gap-1"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <span>{listing.title}</span>
                      <Eye className="h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100" />
                    </span>
                    <span className="inline-flex items-center gap-1 mt-0.5 text-xxs font-medium text-muted-foreground">
                      <span
                        className={`px-1.5 py-0.5 rounded-full ${listing.listingDirection === "SELL" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300" : "bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300"}`}
                      >
                        {listing.listingDirection === "SELL"
                          ? "Offre"
                          : "Demande"}
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {typeof listing.categoryId === "object"
                    ? listing.categoryId.name
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {listing.price} DH
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {seller}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{province}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={listing.status} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {!isApproved && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-200"
                        title="Approuver (Activer)"
                        disabled={moderateMutation.isPending}
                        onClick={() =>
                          moderateMutation.mutate({
                            id: listing._id,
                            status: "active",
                          })
                        }
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {!isPaused && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-orange-600 hover:bg-orange-500 hover:text-white border-orange-200"
                        title="Mettre en pause"
                        disabled={moderateMutation.isPending}
                        onClick={() =>
                          moderateMutation.mutate({
                            id: listing._id,
                            status: "paused",
                          })
                        }
                      >
                        <PauseCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {!isRejected && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-200"
                        title="Rejeter"
                        disabled={moderateMutation.isPending}
                        onClick={() =>
                          moderateMutation.mutate({
                            id: listing._id,
                            status: "rejected",
                          })
                        }
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white border-destructive/20"
                      title="Supprimer définitivement"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            "Voulez-vous vraiment supprimer définitivement cette annonce ?",
                          )
                        ) {
                          deleteMutation.mutate(listing._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : (
        <EmptyState
          title="Aucune annonce"
          description="Aucune annonce enregistrée ne correspond à vos filtres."
        />
      )}

      {/* Premium Listing Preview Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 animate-in fade-in duration-200">
          <div className="bg-card border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-card z-10">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {selectedListing.title}
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {selectedListing._id}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedListing(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Images Grid */}
              {selectedListing.images?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedListing.images.map((img: any, idx: number) => {
                    const url = typeof img === "object" ? img.url : img;
                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border bg-muted hover:opacity-95 transition-opacity"
                        title="Ouvrir l'image en taille réelle"
                      >
                        <img
                          src={url}
                          alt=""
                          className="object-cover w-full h-full"
                        />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center border border-dashed rounded-lg bg-muted/30 text-muted-foreground text-sm">
                  Aucune image disponible pour cette annonce
                </div>
              )}

              {/* Grid properties details */}
              <div className="grid gap-4 sm:grid-cols-2 text-sm border-t pt-4">
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Catégorie
                  </span>
                  <span className="font-semibold text-foreground">
                    {typeof selectedListing.categoryId === "object"
                      ? selectedListing.categoryId.name
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Prix
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {selectedListing.price} DH
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Vendeur (Fellah)
                  </span>
                  <span className="font-semibold text-foreground">
                    {typeof selectedListing.sellerId === "object"
                      ? `${selectedListing.sellerId.firstName} ${selectedListing.sellerId.lastName}`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Téléphone
                  </span>
                  <span
                    className="font-semibold font-mono text-foreground"
                    dir="ltr"
                  >
                    {typeof selectedListing.sellerId === "object"
                      ? selectedListing.sellerId.phone
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Type de transaction
                  </span>
                  <span className="font-semibold text-foreground">
                    {selectedListing.listingDirection === "SELL"
                      ? "Offre (Vente)"
                      : "Demande (Achat)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">
                    Statut actuel
                  </span>
                  <span className="mt-1 block w-fit">
                    <StatusBadge value={selectedListing.status} />
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-4 space-y-1.5">
                <h4 className="font-semibold text-sm text-foreground">
                  Description de l'annonce
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {selectedListing.description}
                </p>
              </div>

              {/* Modal Moderation Actions inside footer */}
              <div className="border-t pt-4 flex justify-between gap-2">
                <div className="flex gap-2">
                  {selectedListing.status !== "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                      disabled={moderateMutation.isPending}
                      onClick={() =>
                        moderateMutation.mutate({
                          id: selectedListing._id,
                          status: "active",
                        })
                      }
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approuver l'annonce</span>
                    </Button>
                  )}
                  {selectedListing.status !== "paused" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white"
                      disabled={moderateMutation.isPending}
                      onClick={() =>
                        moderateMutation.mutate({
                          id: selectedListing._id,
                          status: "paused",
                        })
                      }
                    >
                      <PauseCircle className="h-4 w-4" />
                      <span>Mettre en pause</span>
                    </Button>
                  )}
                  {selectedListing.status !== "rejected" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white"
                      disabled={moderateMutation.isPending}
                      onClick={() =>
                        moderateMutation.mutate({
                          id: selectedListing._id,
                          status: "rejected",
                        })
                      }
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rejeter l'annonce</span>
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        "Voulez-vous vraiment supprimer définitivement cette annonce ?",
                      )
                    ) {
                      deleteMutation.mutate(selectedListing._id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer définitivement</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
