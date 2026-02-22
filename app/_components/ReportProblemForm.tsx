"use client";

import { useState } from "react";

export function ReportProblemForm({
  onClose,
  pageUrl,
}: {
  onClose: () => void;
  pageUrl?: string;
}) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/problem-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || undefined,
          pageUrl: pageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.details?.fieldErrors?.message?.[0] || "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      setMessage("");
      setEmail("");
      setStatus("success");
      setTimeout(onClose, 1500);
    } catch {
      setErrorMsg("Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-emerald-600">
        Merci, le problème a bien été signalé. Nous le traiterons au plus vite.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="problem-report-message" className="block text-sm font-medium text-slate-700">
          Votre message
        </label>
        <textarea
          id="problem-report-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ex: question, problème technique, demande..."
          rows={3}
          required
          maxLength={2000}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
      </div>
      <div>
        <label htmlFor="problem-report-email" className="block text-sm font-medium text-slate-700">
          Votre email (optionnel, pour vous recontacter)
        </label>
        <input
          id="problem-report-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
      </div>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === "loading" || !message.trim()}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {status === "loading" ? "Envoi..." : "Envoyer"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
