"use client";

import { useMemo, useState } from "react";

type Report = {
  id: string;
  status: "PENDING_PAYMENT" | "PAID_AWAITING_UPLOAD" | "READY" | "FAILED";
  provider: string;
  country?: string | null;
  vin?: string | null;
  reportUrl?: string | null;
  amountCents: number;
  currency: string;
  errorMessage?: string | null;
};

export function ManageReport({
  manageToken,
  listingId,
  existingReports,
}: {
  manageToken: string;
  listingId: string;
  existingReports: Report[];
}) {
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [provider, setProvider] = useState<"carvertical" | "manual">("carvertical");

  const paidReport = useMemo(
    () => existingReports.find((r) => r.status === "PAID_AWAITING_UPLOAD" || r.status === "READY"),
    [existingReports]
  );

  async function createReportSlot() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/reports/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        manageToken,
        provider,
      }),
    });
    const body = (await res.json().catch(() => null)) as { reportId?: string } | null;
    setBusy(false);
    if (!res.ok || !body?.reportId) {
      setMessage("Impossible de créer le rapport.");
      return;
    }
    window.location.reload();
  }

  async function startCheckout() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/reports/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        manageToken,
        provider: "manual",
      }),
    });
    const body = (await res.json().catch(() => null)) as { url?: string } | null;
    setBusy(false);

    if (!res.ok || !body?.url) {
      setMessage("Paiement indisponible (configure Stripe dans .env).");
      return;
    }
    window.location.href = body.url;
  }

  async function upload(file: File, reportId: string) {
    setUploadBusy(true);
    setMessage(null);
    const fd = new FormData();
    fd.set("manageToken", manageToken);
    fd.set("reportId", reportId);
    fd.set("file", file);

    const res = await fetch("/api/reports/upload", { method: "POST", body: fd });
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | { error?: string } | null;
    setUploadBusy(false);

    if (!res.ok || !body || !("ok" in body)) {
      setMessage("Upload impossible.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
      <div className="text-lg font-semibold">Rapport d’historique</div>
      <div className="mt-2 text-sm text-slate-600">
        Le vendeur peut ajouter un rapport (accidents / kilométrage / usage / rappels) selon disponibilité des
        sources. Sans compte, ce lien est la clé de gestion.
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-800">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as "carvertical" | "manual")}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm"
          >
            <option value="carvertical">carVertical (recommandé)</option>
            <option value="manual">Autre / manuel</option>
          </select>
          {provider === "carvertical" ? (
            <div className="mt-2 text-xs text-slate-600">
              Étapes: acheter le rapport sur carVertical, télécharger le PDF, puis l’uploader ici.
              <a
                className="ml-2 text-sky-700 underline"
                href="https://www.carvertical.com/"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir carVertical
              </a>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-600">
              Optionnel: payer via Stripe (si configuré) ou uploader un PDF venant d’un autre service.
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            onClick={createReportSlot}
            disabled={busy || !!paidReport}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {paidReport ? "Rapport déjà créé" : busy ? "Création..." : "Créer / Ajouter un rapport"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {provider === "manual" ? (
          <button
            onClick={startCheckout}
            disabled={busy}
            className="rounded-xl bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
          >
            {busy ? "Ouverture du paiement..." : "Payer via Stripe (optionnel)"}
          </button>
        ) : null}

        <a
          href={`/listings/${listingId}`}
          className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
        >
          Voir l’annonce
        </a>
      </div>

      {message ? <div className="mt-3 text-sm text-red-700">{message}</div> : null}

      {paidReport ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <div className="text-sm font-semibold">État</div>
          <div className="mt-1 text-sm text-slate-700">
            {paidReport.status === "READY" ? "Rapport prêt" : "Payé — en attente d’upload"}
          </div>
          {paidReport.reportUrl ? (
            <a className="mt-2 inline-block text-sm text-sky-700 underline" href={paidReport.reportUrl}>
              Télécharger le rapport
            </a>
          ) : null}

          {paidReport.status === "PAID_AWAITING_UPLOAD" ? (
            <div className="mt-4">
              <label className="text-sm font-medium text-slate-800">Uploader le PDF du rapport</label>
              <input
                type="file"
                accept="application/pdf"
                disabled={uploadBusy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f, paidReport.id);
                }}
                className="mt-2 block w-full text-sm"
              />
              <div className="mt-1 text-xs text-slate-500">
                En local on stocke dans `public/reports/`. En production on branchera S3/Cloudinary.
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

