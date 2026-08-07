"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { clientApi } from "@/lib/client-api";
import type { Setting } from "@/lib/types";

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("+212 5 22 00 00 00");
  const [supportEmail, setSupportEmail] = useState("support@soukelfellah.ma");

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const { data } = await clientApi.get<Setting | { data: Setting }>("/settings");
        const settingData = "data" in data && data.data ? (data.data as Setting) : (data as Setting);
        if (settingData) {
          if (settingData.phone) setPhone(settingData.phone);
          if (settingData.supportEmail) setSupportEmail(settingData.supportEmail);
        }
      } catch (e) {
        // Fallback default values are kept if error occurs
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
            سوق الفلاح • Souk El Fellah
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Dernière mise à jour : 21 Juillet 2026 • Conforme à la Loi n° 09-08 (CNDP Maroc)
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          /* Content */
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                1. Introduction & Engagement
              </h2>
              <p>
                Bienvenue sur <strong>Souk El Fellah (سوق الفلاح)</strong>, la plateforme marocaine dédiée aux agriculteurs, élevages et matériel agricole. Nous accordons une importance capitale à la protection de vos données personnelles et au respect de la législation en vigueur au Royaume du Maroc (Loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                2. Données collectées
              </h2>
              <p>Dans le cadre de l’utilisation de l’application Souk El Fellah, nous collectons les données suivantes :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Informations d'inscription :</strong> Nom, Prénom, Numéro de téléphone, Numéro WhatsApp (optionnel), Région et Ville.</li>
                <li><strong>Annonces publiées :</strong> Titres, descriptions, prix, photos des produits agricoles/animaux/équipements et localisation.</li>
                <li><strong>Données techniques :</strong> Version de l'application, système d'exploitation et identifiants de notifications push (OneSignal).</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                3. Finalité du traitement des données
              </h2>
              <p>Vos données sont collectées exclusivement pour :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Permettre la mise en relation directe entre acheteurs et vendeurs (par appel téléphonique ou WhatsApp).</li>
                <li>Afficher vos annonces d'offres et de demandes agricoles.</li>
                <li>Assurer la sécurité de la plateforme, prévenir les fraudes et réinitialiser les mots de passe à votre demande.</li>
                <li>Envoyer des notifications relatives à vos annonces et aux mises à jour importantes.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                4. Partage des données
              </h2>
              <p>
                Vos données téléphoniques publiques ne sont visibles que sur les annonces que vous choisissez délibérément de publier. Souk El Fellah ne vend, ne loue et ne cède aucune de vos données personnelles à des tiers à des fins commerciales.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                5. Suppression des données et droit d'accès
              </h2>
              <p>
                Conformément à la loi 09-08 et aux règles du Google Play Store, vous disposez d'un droit d'accès, de rectification et de suppression totale de vos données.
              </p>
              <p>
                Vous pouvez supprimer votre compte directement dans l'application via le bouton <strong>"Supprimer mon compte"</strong> dans la rubrique <em>Mon Compte</em>, ou soumettre une demande de suppression en ligne sur notre page dédiée :{" "}
                <a href="/delete-account" className="text-emerald-600 dark:text-emerald-400 font-medium underline">
                  Demande de suppression de compte
                </a>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                6. Contact Support
              </h2>
              <p>
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez notre équipe support :
              </p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                Téléphone & WhatsApp : {phone}
              </p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                E-mail : {supportEmail}
              </p>
            </section>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-10 text-center text-xs text-slate-500">
          © 2026 Souk El Fellah (سوق الفلاح). Tous droits réservés.
        </div>
      </div>
    </div>
  );
}
