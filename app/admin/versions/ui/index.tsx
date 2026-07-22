"use client";

import { Plus, Trash2, Smartphone, FileSpreadsheet, Laptop, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import type { AppVersion } from "@/lib/types";

export function AdminVersionsClient() {
  const queryClient = useQueryClient();

  // Create form states
  const [platform, setPlatform] = useState<"ios" | "android">("android");
  const [versionNumber, setVersionNumber] = useState("");
  const [buildNumber, setBuildNumber] = useState("");
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // Fetch app releases history
  const { data: versionsRes, isLoading } = useQuery({
    queryKey: ["admin-app-versions"],
    queryFn: async () => {
      const { data } = await clientApi.get<{ success: boolean; data: AppVersion[] }>("/app-versions");
      return data;
    },
  });

  // Create version mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => clientApi.post("/app-versions", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions"] });
      toast.success("Version enregistrée avec succès");
      // Reset form
      setVersionNumber("");
      setBuildNumber("");
      setIsForceUpdate(false);
      setIsInMaintenance(false);
      setReleaseNotes("");
      setDownloadUrl("");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible d'enregistrer la version",
      );
    },
  });

  // Toggle flags mutation (isActive, isForceUpdate, isInMaintenance)
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) =>
      clientApi.put(`/app-versions/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions"] });
      toast.success("Paramètres mis à jour");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de modifier les paramètres",
      );
    },
  });

  // Delete version mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => clientApi.delete(`/app-versions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-app-versions"] });
      toast.success("Version supprimée");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible de supprimer",
      );
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionNumber.trim()) {
      toast.error("Veuillez saisir le numéro de version");
      return;
    }
    if (!buildNumber.trim()) {
      toast.error("Veuillez saisir le numéro de build");
      return;
    }
    const build = parseInt(buildNumber);
    if (isNaN(build)) {
      toast.error("Le build doit être un nombre valide");
      return;
    }

    createMutation.mutate({
      platform,
      versionNumber: versionNumber.trim(),
      buildNumber: build,
      isForceUpdate,
      isInMaintenance,
      releaseNotes: releaseNotes.trim(),
      downloadUrl: downloadUrl.trim(),
    });
  };

  const toggleStatusField = (id: string, field: "isActive" | "isForceUpdate" | "isInMaintenance", currentValue: boolean) => {
    updateMutation.mutate({
      id,
      payload: { [field]: !currentValue },
    });
  };

  const versionsList = versionsRes?.data ?? [];

  if (isLoading) return <LoadingState label="Chargement des versions de l'application..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Creation form on left */}
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Enregistrer une version</span>
          </CardTitle>
          <CardDescription>Publiez une nouvelle build pour l'application mobile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="platform">Système d'exploitation</Label>
              <Select value={platform} onValueChange={(val: any) => setPlatform(val)}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS (Apple)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="version-num">Version (ex: 1.0.4)</Label>
                <Input
                  id="version-num"
                  placeholder="1.0.0"
                  value={versionNumber}
                  onChange={(e) => setVersionNumber(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="build-num">Build (ex: 12)</Label>
                <Input
                  id="build-num"
                  placeholder="1"
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="force-update" className="text-sm font-semibold cursor-pointer">
                    Mise à jour obligatoire
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Force l'utilisateur à installer cette version pour continuer.
                  </p>
                </div>
                <Switch
                  id="force-update"
                  checked={isForceUpdate}
                  onCheckedChange={setIsForceUpdate}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode" className="text-sm font-semibold cursor-pointer">
                    Mode maintenance
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Bloque l'accès à l'application mobile temporairement.
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={isInMaintenance}
                  onCheckedChange={setIsInMaintenance}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="download-url">Lien de téléchargement</Label>
              <Input
                id="download-url"
                placeholder="https://play.google.com/..."
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="release-notes">Notes de mise à jour</Label>
              <Textarea
                id="release-notes"
                placeholder="Corrections de bugs, nouvelles fonctionnalités..."
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold gap-1.5 mt-2"
              disabled={createMutation.isPending}
            >
              <Plus className="h-4 w-4" />
              <span>Enregistrer la version</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Versions history on right */}
      <Card className="lg:col-span-2 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Historique des versions</span>
          </CardTitle>
          <CardDescription>Liste des versions enregistrées et états de maintenance de l'application.</CardDescription>
        </CardHeader>
        <CardContent>
          {versionsList.length ? (
            <DataTable headers={["OS", "Version (Build)", "Force", "Maintenance", "Actif", "Notes", "Actions"]}>
              {versionsList.map((ver) => (
                <tr key={ver._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-sm">
                      {ver.platform === "ios" ? (
                        <>
                          <Laptop className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          <span>iOS</span>
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Android</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    v{ver.versionNumber} ({ver.buildNumber})
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-1 hover:bg-accent/40"
                      onClick={() => toggleStatusField(ver._id, "isForceUpdate", ver.isForceUpdate)}
                      disabled={updateMutation.isPending}
                    >
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-medium ${ver.isForceUpdate ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>
                        {ver.isForceUpdate ? "Obligatoire" : "Optionnel"}
                      </span>
                    </Button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-1 hover:bg-accent/40"
                      onClick={() => toggleStatusField(ver._id, "isInMaintenance", ver.isInMaintenance)}
                      disabled={updateMutation.isPending}
                    >
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xxs font-medium ${ver.isInMaintenance ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300" : "bg-muted text-muted-foreground"}`}>
                        {ver.isInMaintenance ? "Maintenance" : "Ouvert"}
                      </span>
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 p-1 hover:bg-accent/40"
                      onClick={() => toggleStatusField(ver._id, "isActive", ver.isActive)}
                      disabled={updateMutation.isPending}
                    >
                      <StatusBadge value={ver.isActive ? "active" : "inactive"} />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate" title={ver.releaseNotes}>
                    {ver.releaseNotes || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                      title="Supprimer la version"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`Voulez-vous vraiment supprimer la version v${ver.versionNumber} ?`)) {
                          deleteMutation.mutate(ver._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title="Aucune version"
              description="Aucune version enregistrée pour l'application mobile."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
