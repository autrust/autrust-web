"use client";

import Link from "next/link";
import { useState } from "react";

export type GarageRow = {
  id: string;
  email: string;
  phone: string | null;
  vatNumber: string | null;
  selectedPlan: string | null;
  maxListings: number | null;
  createdAt: string; // ISO string (serialized from server)
  totalListings: number;
  active: number;
  sold: number;
  /** Montant total des ventes (€) */
  soldAmountEur: number;
  /** Nombre d'annonces avec vérification CarVertical */
  carVerticalCount: number;
};

export type AdminStats = {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalGarages: number;
  totalAlerts: number;
  recentFeedbacks: number;
  problemReportsCount: number;
};

export type ProblemReportRow = {
  id: string;
  message: string;
  email: string | null;
  pageUrl: string | null;
  createdAt: string;
};

const OWNER_EMAILS = ["candel.s@hotmail.fr", "candel.pro@hotmail.com"];

export function AdminTabs({
  stats,
  garages,
  ownerEmail,
  recentProblems = [],
}: {
  stats: AdminStats;
  garages: GarageRow[];
  ownerEmail?: string | null;
  recentProblems?: ProblemReportRow[];
}) {
  const showMesChiffres = ownerEmail && OWNER_EMAILS.includes(ownerEmail.toLowerCase());
  const [tab, setTab] = useState<"overview" | "garages">("overview");

  return (
    <div className="mt-8">
      <div className="flex gap-1 rounded-xl border border-slate-200/70 bg-slate-50/50 p-1">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "overview"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Vue d&apos;ensemble
        </button>
        <button
          type="button"
          onClick={() => setTab("garages")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            tab === "garages"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Garages ({garages.length})
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Utilisateurs</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalUsers}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Annonces</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalListings}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {stats.activeListings} actives, {stats.soldListings} vendues
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Garages</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.totalGarages}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Alertes</div>
              <div className="mt-1 text-2xl font-bold text-amber-600">
                {stats.totalAlerts}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Problèmes signalés</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {stats.problemReportsCount}
              </div>
            </div>
          </div>

          {recentProblems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-800">
                Derniers problèmes signalés
              </h2>
              <div className="mt-4 space-y-3">
                {recentProblems.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{p.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {p.email && <span>Contact : {p.email}</span>}
                      {p.pageUrl && (
                        <span className="truncate max-w-xs" title={p.pageUrl}>
                          Page : {p.pageUrl}
                        </span>
                      )}
                      <time>
                        {new Date(p.createdAt).toLocaleDateString("fr-BE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/problems"
                className="mt-3 inline-block text-sm text-sky-600 hover:text-sky-700"
              >
                Voir tous les problèmes signalés →
              </Link>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-800">
              Pages d&apos;administration
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/admin/garages"
                className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
              >
                <span className="text-lg font-semibold text-slate-900">
                  Garages
                </span>
                <span className="mt-1 text-sm text-slate-600">
                  {stats.totalGarages} professionnel
                  {stats.totalGarages !== 1 ? "s" : ""} — Ventes et annonces
                </span>
              </Link>
              <Link
                href="/admin/users"
                className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
              >
                <span className="text-lg font-semibold text-slate-900">
                  Utilisateurs
                </span>
                <span className="mt-1 text-sm text-slate-600">
                  {stats.totalUsers} compte{stats.totalUsers !== 1 ? "s" : ""} —
                  Gestion et blocage
                </span>
              </Link>
              <Link
                href="/admin/alertes"
                className="flex flex-col rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5 shadow-sm transition hover:border-amber-300 hover:bg-amber-100/50"
              >
                <span className="text-lg font-semibold text-amber-900">
                  Alertes
                </span>
                <span className="mt-1 text-sm text-amber-700">
                  {stats.totalAlerts} alerte{stats.totalAlerts !== 1 ? "s" : ""}{" "}
                  — Particuliers avec trop d&apos;annonces
                </span>
              </Link>
              {showMesChiffres && (
                <Link
                  href="/admin/mes-chiffres"
                  className="flex flex-col rounded-2xl border-2 border-emerald-200/70 bg-emerald-50/50 p-5 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100/50"
                >
                  <span className="text-lg font-semibold text-emerald-900">
                    Mes chiffres
                  </span>
                  <span className="mt-1 text-sm text-emerald-700">
                    Abonnements, mises en avant, CarVertical, acomptes
                  </span>
                </Link>
              )}
              <Link
                href="/admin/feedback"
                className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
              >
                <span className="text-lg font-semibold text-slate-900">
                  Avis site
                </span>
                <span className="mt-1 text-sm text-slate-600">
                  {stats.recentFeedbacks} avis — Retours utilisateurs
                </span>
              </Link>
              <Link
                href="/admin/problems"
                className="flex flex-col rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5 shadow-sm transition hover:border-amber-300 hover:bg-amber-100/50"
              >
                <span className="text-lg font-semibold text-amber-900">
                  Problèmes signalés
                </span>
                <span className="mt-1 text-sm text-amber-700">
                  {stats.problemReportsCount} signalement{stats.problemReportsCount !== 1 ? "s" : ""} — Voir le détail
                </span>
              </Link>
              <Link
                href="/voir-en-tant-qu-acheteur"
                className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
              >
                <span className="text-lg font-semibold text-slate-900">
                  Voir en tant qu&apos;acheteur
                </span>
                <span className="mt-1 text-sm text-slate-600">
                  Prévisualiser l&apos;expérience acheteur
                </span>
              </Link>
              <Link
                href="/listings"
                className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
              >
                <span className="text-lg font-semibold text-slate-900">
                  Voir les annonces
                </span>
                <span className="mt-1 text-sm text-slate-600">
                  Liste publique — {stats.activeListings} annonces actives
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-800">
              Actions rapides
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Déposer une annonce test
              </Link>
              <Link
                href="/account"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Mon compte
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Page d&apos;accueil
              </Link>
            </div>
          </div>
        </>
      )}

      {tab === "garages" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Garage
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    TVA
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Abonnement
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Nombre de véhicules
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Actives
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Ventes (nb)
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Montant ventes
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700" title="Véhicules avec CarVertical">
                    CarVertical
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody>
                {garages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Aucun professionnel pour le moment.
                    </td>
                  </tr>
                ) : (
                  garages.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/garages/${g.id}`}
                          className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
                        >
                          {g.email}
                        </Link>
                        {g.phone && (
                          <div className="text-xs text-slate-500">
                            {g.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {g.vatNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {g.selectedPlan
                          ? `${g.selectedPlan}${g.maxListings != null ? ` — ${g.maxListings} annonces max` : ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {g.totalListings}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {g.active}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        {g.sold}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {g.soldAmountEur > 0
                          ? new Intl.NumberFormat("fr-BE", {
                              style: "currency",
                              currency: "EUR",
                              maximumFractionDigits: 0,
                            }).format(g.soldAmountEur)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {g.carVerticalCount > 0 ? (
                          <span className="font-medium text-emerald-700" title={`${g.carVerticalCount} véhicule(s) avec CarVertical`}>
                            {g.carVerticalCount}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(g.createdAt).toLocaleDateString("fr-BE")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-600">
            Cliquez sur un garage pour voir ses données, le détail de ses
            véhicules et de ses ventes.
          </div>
        </div>
      )}
    </div>
  );
}
