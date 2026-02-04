"use client";

import { useState } from "react";

type ExistingKyc =
  | {
      status: "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
      documentType: string;
      createdAt: string;
    }
  | null;

export function ManageKyc({
  manageToken,
  existingKyc,
}: {
  manageToken: string;
  existingKyc: ExistingKyc;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<"id_card" | "passport">("id_card");
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const status = existingKyc?.status;
  const statusLabel =
    status === "VERIFIED"
      ? "Vérifié"
      : status === "REJECTED"
        ? "Refusé"
        : status === "PENDING_REVIEW"
          ? "En cours de vérification"
          : "Non envoyé";

  async function submit() {
    if (!idDoc) {
      setMessage("Ajoute un document d’identité.");
      return;
    }
    setBusy(true);
    setMessage(null);

    const fd = new FormData();
    fd.set("manageToken", manageToken);
    fd.set("documentType", documentType);
    fd.set("idDocument", idDoc);
    if (selfie) fd.set("selfie", selfie);

    const res = await fetch("/api/kyc/upload", { method: "POST", body: fd });
    const body = (await res.json().catch(() => null)) as { ok?: boolean } | { error?: string } | null;
    setBusy(false);

    if (!res.ok || !body || !("ok" in body)) {
      setMessage("Upload impossible.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
      <div className="text-lg font-semibold">Vendeur vérifié (KYC light)</div>
      <div className="mt-2 text-sm text-slate-600">
        Envoie une pièce d’identité (carte ou passeport). Un selfie est optionnel. Statut actuel:{" "}
        <span className="font-medium text-slate-900">{statusLabel}</span>.
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-1">
          <label className="text-sm font-medium text-slate-800">Type de document</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as "id_card" | "passport")}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm"
          >
            <option value="id_card">Carte d’identité</option>
            <option value="passport">Passeport</option>
          </select>
        </div>

        <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-800">Document d’identité (obligatoire)</label>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => setIdDoc(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
            />
            <div className="mt-1 text-xs text-slate-500">PDF ou photo. 10MB max.</div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-800">Selfie (optionnel)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
            />
            <div className="mt-1 text-xs text-slate-500">Photo uniquement. 10MB max.</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy ? "Envoi..." : "Envoyer les documents"}
        </button>
      </div>

      {message ? <div className="mt-3 text-sm text-red-700">{message}</div> : null}

      <div className="mt-3 text-xs text-slate-500">
        Données sensibles: en MVP on stocke en local (non public). En production on chiffrera et on limitera
        l’accès via back-office.
      </div>
    </div>
  );
}

