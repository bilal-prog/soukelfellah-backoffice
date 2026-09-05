"use client";

import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  Save,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  Wrench,
  Globe,
  BellRing,
} from "lucide-react";
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
  
  // Maintenance Mode states
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [notifyAdminOnNewListing, setNotifyAdminOnNewListing] = useState(false);
  const [msgFr, setMsgFr] = useState("");
  const [msgAr, setMsgAr] = useState("");
  const [msgEn, setMsgEn] = useState("");
  const [msgAry, setMsgAry] = useState("");

  const [activeLangTab, setActiveLangTab] = useState<"fr" | "ar" | "en" | "ary">("fr");

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
          setIsInMaintenance(!!settingData.isInMaintenance);
          setNotifyAdminOnNewListing(!!settingData.notifyAdminOnNewListing);
          setMsgFr(settingData.maintenanceMessage?.fr || "Le site est actuellement en maintenance. Nous serons bientôt de retour !");
          setMsgAr(settingData.maintenanceMessage?.ar || "الموقع حالياً في الصيانة لتحسين خدماتنا. سنعود قريباً !");
          setMsgEn(settingData.maintenanceMessage?.en || "The site is currently under maintenance. We will be back shortly!");
          setMsgAry(settingData.maintenanceMessage?.ary || "الموقع دابا فـ الصيانة باش نجددو الخدمة. راجعين دغيا !");
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
        isInMaintenance,
        notifyAdminOnNewListing,
        maintenanceMessage: {
          fr: msgFr,
          ar: msgAr,
          en: msgEn,
          ary: msgAry,
        },
      });
      const updated: Setting = "data" in data && data.data ? (data.data as Setting) : (data as Setting);
      if (updated) {
        setPhone(updated.phone || "");
        setContactEmail(updated.contactEmail || "");
        setSupportEmail(updated.supportEmail || "");
        setIsInMaintenance(!!updated.isInMaintenance);
        setNotifyAdminOnNewListing(!!updated.notifyAdminOnNewListing);
        if (updated.maintenanceMessage) {
          setMsgFr(updated.maintenanceMessage.fr || "");
          setMsgAr(updated.maintenanceMessage.ar || "");
          setMsgEn(updated.maintenanceMessage.en || "");
          setMsgAry(updated.maintenanceMessage.ary || "");
        }
      }
      toast.success("Paramètres et mode maintenance enregistrés avec succès !");
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
          Gérez les coordonnées officielles ainsi que le mode maintenance global pour le Web et l’Application Mobile.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Global Maintenance Control Card */}
          <div className={`rounded-xl border p-6 transition-all shadow-sm ${
            isInMaintenance
              ? "bg-amber-950/20 border-amber-500/50 dark:border-amber-500/40"
              : "bg-card border-border"
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  isInMaintenance ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"
                }`}>
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Mode Maintenance Général</span>
                    <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full ${
                      isInMaintenance
                        ? "bg-amber-500 text-black animate-pulse"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {isInMaintenance ? "MAINTENANCE ACTIVE" : "EN LIGNE (NORMAL)"}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bloque l’accès au site Web et à l’Application Mobile et affiche l’écran de maintenance.
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isInMaintenance}
                  onChange={(e) => setIsInMaintenance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Maintenance Message Editor */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Message de Maintenance Personnalisé (Multilingue)</span>
                </label>

                {/* Language Tabs */}
                <div className="flex bg-muted/60 p-0.5 rounded-lg text-xs font-bold">
                  {(["fr", "ar", "en", "ary"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setActiveLangTab(l)}
                      className={`px-2.5 py-1 rounded-md transition-all uppercase ${
                        activeLangTab === l
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea by Tab */}
              {activeLangTab === "fr" && (
                <textarea
                  rows={2}
                  value={msgFr}
                  onChange={(e) => setMsgFr(e.target.value)}
                  placeholder="Message en Français..."
                  className="w-full p-3 bg-background border rounded-lg text-xs text-foreground focus:ring-2 focus:ring-amber-500 outline-none"
                />
              )}
              {activeLangTab === "ar" && (
                <textarea
                  rows={2}
                  dir="rtl"
                  value={msgAr}
                  onChange={(e) => setMsgAr(e.target.value)}
                  placeholder="الرسالة بالعربية..."
                  className="w-full p-3 bg-background border rounded-lg text-xs text-foreground focus:ring-2 focus:ring-amber-500 outline-none font-[#Noto Sans Arabic]"
                />
              )}
              {activeLangTab === "en" && (
                <textarea
                  rows={2}
                  value={msgEn}
                  onChange={(e) => setMsgEn(e.target.value)}
                  placeholder="Message in English..."
                  className="w-full p-3 bg-background border rounded-lg text-xs text-foreground focus:ring-2 focus:ring-amber-500 outline-none"
                />
              )}
              {activeLangTab === "ary" && (
                <textarea
                  rows={2}
                  dir="rtl"
                  value={msgAry}
                  onChange={(e) => setMsgAry(e.target.value)}
                  placeholder="الرسالة بالدارجة..."
                  className="w-full p-3 bg-background border rounded-lg text-xs text-foreground focus:ring-2 focus:ring-amber-500 outline-none font-[#Noto Sans Arabic]"
                />
              )}
            </div>
          </div>

          
          {/* New Listings Email Notification Control Card */}
          <div className={`rounded-xl border p-6 transition-all shadow-sm ${
            notifyAdminOnNewListing
              ? "bg-emerald-950/10 border-emerald-500/50 dark:border-emerald-500/40"
              : "bg-card border-border"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  notifyAdminOnNewListing ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                }`}>
                  <BellRing className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Alertes E-mail Nouvelles Annonces</span>
                    <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full ${
                      notifyAdminOnNewListing
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {notifyAdminOnNewListing ? "ACTIVÉ" : "DÉSACTIVÉ"}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recevoir un e-mail de notification au support technique à chaque création d'annonce.
                  </p>
                </div>
              </div>

              {/* Switch Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={notifyAdminOnNewListing}
                  onChange={(e) => setNotifyAdminOnNewListing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Form Card: Contact & Emails */}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
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
        </div>

        {/* Side Panel: Legal Pages & Status */}
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
              Accès Public Mobile & Web
            </div>
            <p className="text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
              L'application mobile et le site web lisent directement ces informations afin d’assurer la sécurité et le contrôle du mode maintenance en temps réel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
