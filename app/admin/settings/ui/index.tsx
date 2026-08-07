"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, Save, ExternalLink, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import type { Setting } from "@/lib/types";

export function AdminSettingsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const { data } = await clientApi.get<Setting | { data: Setting }>("/settings");
        const settingData: Setting = "data" in data && data.data ? (data.data as Setting) : (data as Setting);
        
        if (settingData) {
          setPhone(settingData.phone || "");
          setContactEmail(settingData.contactEmail || "");
          setSupportEmail(settingData.supportEmail || "");
        }
      } catch (error: any) {
        toast.error("Impossible de charger les paramètres");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await clientApi.put<Setting | { data: Setting }>("/settings", {
        phone,
        contactEmail,
        supportEmail,
      });
      const updated: Setting = "data" in data && data.data ? (data.data as Setting) : (data as Setting);
      if (updated) {
        setPhone(updated.phone || "");
        setContactEmail(updated.contactEmail || "");
        setSupportEmail(updated.supportEmail || "");
      }
      toast.success("Paramètres enregistrés avec succès !");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde des paramètres");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Paramètres Général & Coordonnées Légales
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez le numéro de téléphone et les adresses e-mail de contact affichés publiquement dans l'application mobile et le backoffice.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form Card */}
        <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-foreground">
                Numéro de Téléphone Officiel
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="phone"
                  type="text"
                  placeholder="+212 5 22 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Ce numéro sera affiché dans les mentions légales de l'application et les pages publiques.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="contactEmail" className="block text-sm font-semibold text-foreground">
                E-mail de Contact Général
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="contactEmail"
                  type="email"
                  placeholder="contact@soukelfellah.ma"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Adresse e-mail principale pour les informations officielles et requêtes.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="supportEmail" className="block text-sm font-semibold text-foreground">
                E-mail du Support Technique
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="supportEmail"
                  type="email"
                  placeholder="support@soukelfellah.ma"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Adresse e-mail de support pour la suppression des comptes et réclamations utilisateurs.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Enregistrer les modifications</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Side Panel: Legal Pages & Previews */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
              Pages Légales Publiques
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Les modifications apportées ci-contre sont répercutées instantanément sur l'application mobile et sur les pages légales publiques ci-dessous :
            </p>

            <div className="space-y-2 pt-1">
              <a
                href="/privacy"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition-colors group"
              >
                <span>Politique de Confidentialité</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600" />
              </a>

              <a
                href="/delete-account"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted text-xs font-medium text-foreground transition-colors group"
              >
                <span>Suppression de Compte</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600" />
              </a>
            </div>
          </div>

          <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 p-4 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Accès Public Mobile
            </div>
            <p className="text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
              L'application mobile lit directement ces informations sans restriction de jeton d'authentification afin de garantir l'accès légal depuis l'écran d'inscription.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
