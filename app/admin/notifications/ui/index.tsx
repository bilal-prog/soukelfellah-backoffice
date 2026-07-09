"use client";

import { Send, History, User, Users, Globe, Image } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { clientApi } from "@/lib/client-api";
import type { NotificationsResponse } from "@/lib/types";

const PAGE_SIZE = 10;

export function AdminNotificationsClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Form states
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [userIdsText, setUserIdsText] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Fetch sent notification campaigns history
  const { data: sentRes, isLoading } = useQuery({
    queryKey: ["admin-sent-notifications", page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("offset", ((page - 1) * PAGE_SIZE).toString());
      const { data } = await clientApi.get<NotificationsResponse>(
        "/notifications/sent",
        { params }
      );
      return data;
    },
  });

  // Send marketing notification mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (payload: any) =>
      clientApi.post("/notifications/marketing", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sent-notifications"] });
      toast.success("Campagne de notifications envoyée avec succès");
      // Reset form
      setTitle("");
      setMessage("");
      setImageUrl("");
      setUserIdsText("");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Impossible d'envoyer la notification",
      );
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Veuillez saisir le titre de la notification");
      return;
    }
    if (!message.trim()) {
      toast.error("Veuillez saisir le message de la notification");
      return;
    }

    const payload: any = {
      target,
      title: title.trim(),
      message: message.trim(),
    };

    if (imageUrl.trim()) {
      payload.imageUrl = imageUrl.trim();
    }

    if (target === "specific") {
      const ids = userIdsText
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
      if (ids.length === 0) {
        toast.error("Veuillez saisir au moins un ID utilisateur");
        return;
      }
      payload.userIds = ids;
    }

    sendCampaignMutation.mutate(payload);
  };

  const handlePageChange = (newOffset: number) => {
    const newPage = Math.floor(newOffset / PAGE_SIZE) + 1;
    setPage(newPage);
  };

  const sentCampaigns = sentRes?.data ?? [];
  const meta = sentRes?.meta ? {
    total: sentRes.meta.total,
    limit: PAGE_SIZE,
    offset: (sentRes.meta.page - 1) * PAGE_SIZE,
  } : undefined;

  if (isLoading) return <LoadingState label="Chargement de l'historique des campagnes..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Campaign Form */}
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Créer une campagne (Push)</span>
          </CardTitle>
          <CardDescription>Envoyez une notification instantanée à l'audience sélectionnée.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="target-audience" className="text-sm font-medium">Audience cible</Label>
              <Select value={target} onValueChange={(val: any) => setTarget(val)}>
                <SelectTrigger id="target-audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="all">Tous les appareils (Tous)</SelectItem>
                  <SelectItem value="specific">Utilisateurs spécifiques (par ID)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {target === "specific" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="target-ids">IDs Utilisateurs (séparés par des virgules)</Label>
                <Textarea
                  id="target-ids"
                  placeholder="Ex: 64b0f9f3..., 64b0f9f4..."
                  value={userIdsText}
                  onChange={(e) => setUserIdsText(e.target.value)}
                  dir="ltr"
                  className="font-mono text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="campaign-title">Titre de la notification</Label>
              <Input
                id="campaign-title"
                placeholder="Ex: Nouvelle offre disponible..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-body">Message</Label>
              <Textarea
                id="campaign-body"
                placeholder="Rédigez le texte de la notification..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="campaign-image" className="flex items-center gap-1.5">
                <Image className="h-4 w-4 text-muted-foreground" />
                <span>Lien de l'image (optionnel)</span>
              </Label>
              <Input
                id="campaign-image"
                placeholder="https://example.com/banner.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-semibold gap-1.5 mt-2"
              disabled={sendCampaignMutation.isPending}
            >
              <Send className="h-4 w-4" />
              <span>Diffuser la notification</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Campaigns History */}
      <Card className="lg:col-span-2 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Notifications envoyées</span>
          </CardTitle>
          <CardDescription>Consultez l'historique des notifications précédemment envoyées aux téléphones.</CardDescription>
        </CardHeader>
        <CardContent>
          {sentCampaigns.length ? (
            <DataTable headers={["Titre", "Message", "Destinataires", "Date de diffusion"]}>
              {sentCampaigns.map((camp) => (
                <tr key={camp._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground max-w-[150px] truncate">
                    {camp.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[250px] truncate" title={camp.message}>
                    {camp.message}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-700/10">
                      <Users className="h-3.5 w-3.5" />
                      <span>{camp.recipientCount ?? camp.metadata?.recipientCount ?? "Tous"} appareils</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(camp.createdAt).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title="Historique vide"
              description="Aucune campagne de notifications n'a été émise pour le moment."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
