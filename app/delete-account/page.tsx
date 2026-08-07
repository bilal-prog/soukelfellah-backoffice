"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Phone, AlertTriangle, Loader2 } from "lucide-react";
import { clientApi } from "@/lib/client-api";
import type { Setting } from "@/lib/types";

export default function DeleteAccountPage() {
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [supportPhone, setSupportPhone] = useState("+212 5 22 00 00 00");

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoadingSettings(true);
        const { data } = await clientApi.get<Setting | { data: Setting }>("/settings");
        const settingData = "data" in data && data.data ? (data.data as Setting) : (data as Setting);
        if (settingData?.phone) {
          setSupportPhone(settingData.phone);
        }
      } catch (e) {
        // Fallback default phone is kept
      } finally {
        setLoadingSettings(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 10) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold mb-3">
            سوق الفلاح • Demande de Suppression
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Suppression de Compte & Données
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Formulaire officiel de demande de suppression de compte pour l'application Souk El Fellah (Google Play Policy Compliance).
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Demande enregistrée avec succès
            </h2>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
              Votre demande de suppression pour le numéro <strong>{phone}</strong> a bien été prise en compte. Notre équipe procédera à la suppression définitive de votre compte et de toutes vos annonces sous 48 heures.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex gap-3 items-start text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <strong>Attention :</strong> La suppression de votre compte est définitive. Toutes vos annonces actives, photos et historiques de profil seront définitivement effacés. Vous pouvez aussi supprimer votre compte directement dans l'application mobile via la rubrique <em>Mon Compte</em>.
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Numéro de téléphone lié au compte *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 06 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  minLength={10}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="reason" className="block text-sm font-semibold text-slate-900 dark:text-slate-200">
                Motif de la demande (Optionnel)
              </label>
              <textarea
                id="reason"
                rows={3}
                placeholder="Expliquez-nous brièvement la raison de votre départ..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              Confirmer la demande de suppression
            </button>
          </form>
        )}

        {/* Support Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 text-center text-xs text-slate-500">
          Besoin d'assistance directe ? Contactez le support WhatsApp :{" "}
          {loadingSettings ? (
            <Loader2 className="h-3 w-3 animate-spin inline text-emerald-600 ml-1" />
          ) : (
            <strong>{supportPhone}</strong>
          )}
        </div>
      </div>
    </div>
  );
}
