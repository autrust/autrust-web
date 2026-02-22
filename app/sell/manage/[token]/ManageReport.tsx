"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CARVERTICAL_DISCOUNT_PERCENT, CARVERTICAL_ORIGINAL_PRICE_EUR, CARVERTICAL_PRICE_EUR } from "@/lib/constants";

type ReportJson = { detailsSubmittedAt?: string; marque?: string; modele?: string; phone?: string; email?: string } | null;
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
  reportJson?: ReportJson;
};

export function ManageReport({
  manageToken,
  listingId,
  existingReports,
  paymentSuccess,
  reportIdFromUrl,
  paymentCanceled,
}: {
  manageToken: string;
  listingId: string;
  existingReports: Report[];
  paymentSuccess?: boolean;
  reportIdFromUrl?: string | null;
  paymentCanceled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [submitDetailsBusy, setSubmitDetailsBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [provider, setProvider] = useState<"carvertical" | "manual">("carvertical");

  const paidReport = useMemo(
    () => existingReports.find((r) => r.status === "PAID_AWAITING_UPLOAD" || r.status === "READY"),
    [existingReports]
  );
  const detailsSubmitted = paidReport?.reportJson && typeof (paidReport.reportJson as ReportJson)?.detailsSubmittedAt === "string";

  const reportJustPaid = reportIdFromUrl && existingReports.find((r) => r.id === reportIdFromUrl && r.status === "PENDING_PAYMENT");

  useEffect(() => {
    if (!paymentSuccess || !reportJustPaid) return;
    const t = setTimeout(() => router.refresh(), 2500);
    return () => clearTimeout(t);
  }, [paymentSuccess, reportJustPaid, router]);

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

  async function startCheckout(providerForCheckout: "carvertical" | "manual") {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/reports/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        manageToken,
        provider: providerForCheckout,
      }),
    });
    const body = (await res.json().catch(() => null)) as { url?: string } | null;
    setBusy(false);

    if (!res.ok || !body?.url) {
      setMessage((body as { error?: string })?.error === "STRIPE_NOT_CONFIGURED" ? "Paiement indisponible : configurez Stripe (STRIPE_SECRET_KEY) dans .env." : "Paiement indisponible (configure Stripe dans .env).");
      return;
    }
    window.location.href = body.url;
  }

  async function submitDetails(e: React.FormEvent<HTMLFormElement>, reportId: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const vin = (form.elements.namedItem("vin") as HTMLInputElement)?.value?.trim() ?? "";
    const marque = (form.elements.namedItem("marque") as HTMLInputElement)?.value?.trim() ?? "";
    const modele = (form.elements.namedItem("modele") as HTMLInputElement)?.value?.trim() ?? "";
    const phone = (form.elements.namedItem("phone") as HTMLInputElement)?.value?.trim() ?? "";
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value?.trim() ?? "";
    if (!vin || !marque || !modele || !phone || !email) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }
    setSubmitDetailsBusy(true);
    setMessage(null);
    const res = await fetch("/api/reports/submit-details", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ manageToken, reportId, vin, marque, modele, phone, email }),
    });
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    setSubmitDetailsBusy(false);
    if (!res.ok || !body?.ok) {
      setMessage(body?.error ?? "Envoi impossible.");
      return;
    }
    window.location.reload();
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
              Rapport à <strong>{CARVERTICAL_PRICE_EUR} €</strong> <span className="text-slate-500">(au lieu de {CARVERTICAL_ORIGINAL_PRICE_EUR.toFixed(2).replace(".", ",")} €, −{CARVERTICAL_DISCOUNT_PERCENT} %)</span>. Cliquez sur « Payer le rapport », effectuez le paiement, puis remplissez le formulaire (VIN, marque, modèle, tél, email). Vous recevrez votre rapport par email sous 24 h.
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
          {provider === "carvertical" ? (
            <button
              type="button"
              onClick={() => startCheckout("carvertical")}
              disabled={busy || !!paidReport}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {paidReport ? "Rapport déjà payé" : busy ? "Redirection vers le paiement..." : `Payer le rapport (${CARVERTICAL_PRICE_EUR} €)`}
            </button>
          ) : (
            <button
              type="button"
              onClick={createReportSlot}
              disabled={busy || !!paidReport}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {paidReport ? "Rapport déjà créé" : busy ? "Création..." : "Créer / Ajouter un rapport"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {provider === "manual" ? (
          <button
            type="button"
            onClick={() => startCheckout("manual")}
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

      {paymentCanceled ? (
        <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Paiement annulé. Vous pouvez réessayer quand vous voulez.</div>
      ) : null}
      {paymentSuccess && reportJustPaid ? (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Paiement réussi. Enregistrement en cours… La page va s’actualiser pour afficher le formulaire.</div>
      ) : null}
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

          {paidReport.status === "PAID_AWAITING_UPLOAD" && paidReport.provider === "carvertical" && !detailsSubmitted ? (
            <form onSubmit={(e) => submitDetails(e, paidReport.id)} className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm font-medium text-slate-800">Renseignez les informations du véhicule pour recevoir votre rapport par email sous 24 h.</p>
              <div>
                <label htmlFor="report-vin" className="block text-xs font-medium text-slate-700">VIN *</label>
                <input id="report-vin" name="vin" type="text" required placeholder="Ex: WVWZZZ3CZWE123456" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="report-marque" className="block text-xs font-medium text-slate-700">Marque du véhicule *</label>
                <input id="report-marque" name="marque" type="text" required placeholder="Ex: Volkswagen" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="report-modele" className="block text-xs font-medium text-slate-700">Modèle *</label>
                <input id="report-modele" name="modele" type="text" required placeholder="Ex: Golf" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="report-phone" className="block text-xs font-medium text-slate-700">Numéro de téléphone *</label>
                <input id="report-phone" name="phone" type="tel" required placeholder="Ex: 0494123456" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="report-email" className="block text-xs font-medium text-slate-700">Adresse email *</label>
                <input id="report-email" name="email" type="email" required placeholder="votre@email.com" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={submitDetailsBusy} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
                {submitDetailsBusy ? "Envoi..." : "Envoyer"}
              </button>
            </form>
          ) : paidReport.status === "PAID_AWAITING_UPLOAD" && paidReport.provider === "carvertical" && detailsSubmitted ? (
            <p className="mt-4 text-sm font-medium text-emerald-700">Dans les 24 h vous recevrez votre rapport par email.</p>
          ) : paidReport.status === "PAID_AWAITING_UPLOAD" && paidReport.provider === "manual" ? (
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

