"use client";

import { useState } from "react";

export function PublishDraftButton({
  listingId,
  canPublish,
  disabledMessage,
}: {
  listingId: string;
  canPublish: boolean;
  disabledMessage?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish() {
    if (!canPublish) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/listings/${listingId}/publish`, { method: "POST" });
    const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
    setBusy(false);
    if (!res.ok) {
      setError(body?.message ?? "Impossible de publier.");
      return;
    }
    window.location.reload();
  }

  if (!canPublish) {
    return (
      <span className="text-xs text-slate-500" title={disabledMessage}>
        {disabledMessage ?? "Vérifiez email et téléphone pour publier"}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handlePublish}
        disabled={busy}
        className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {busy ? "Publication..." : "Publier l'annonce"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
