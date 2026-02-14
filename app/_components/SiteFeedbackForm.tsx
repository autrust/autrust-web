"use client";

import { useState } from "react";
import { RatingStars } from "./RatingStars";

export function SiteFeedbackForm() {
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/site-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stars,
          message: message.trim(),
          email: email.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.details?.fieldErrors?.message?.[0] || "Une erreur est survenue.");
        setStatus("error");
        return;
      }

      setStars(0);
      setMessage("");
      setEmail("");
      setStatus("success");
    } catch {
      setErrorMsg("Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-emerald-600">
        Merci pour votre avis ! Nous en tiendrons compte pour améliorer AuTrust.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="mb-2 text-sm text-slate-600">Notez AuTrust sur 5 étoiles</p>
        <RatingStars value={stars} onChange={setStars} size="lg" />
      </div>
      <div>
        <label htmlFor="site-feedback-message" className="sr-only">
          Qu&apos;est-ce qu&apos;on pourrait améliorer ?
        </label>
        <textarea
          id="site-feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Qu'est-ce qu'on pourrait améliorer sur AuTrust ?"
          rows={3}
          required
          maxLength={2000}
          className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
      </div>
      <div>
        <label htmlFor="site-feedback-email" className="sr-only">
          Votre email (optionnel)
        </label>
        <input
          id="site-feedback-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email (optionnel)"
          className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
      </div>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading" || !message.trim() || stars === 0}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {status === "loading" ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
