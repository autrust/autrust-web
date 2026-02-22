"use client";

import { useCallback, useState } from "react";
import { TurnstileWidget } from "@/app/_components/TurnstileWidget";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const body: {
      message: string;
      email?: string;
      pageUrl?: string;
      turnstileToken?: string;
    } = {
      message: message.trim(),
      email: email.trim() || undefined,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    };
    if (turnstileToken) body.turnstileToken = turnstileToken;

    try {
      const res = await fetch("/api/problem-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          details?: { fieldErrors?: { message?: string[] } };
          error?: string;
          message?: string;
        };
        if (data.error === "TURNSTILE_FAILED") {
          setErrorMsg("Vérification anti-robot échouée. Réessayez.");
        } else {
          setErrorMsg(data.details?.fieldErrors?.message?.[0] ?? data.message ?? "Une erreur est survenue.");
        }
        setStatus("error");
        return;
      }

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
      <p className="text-emerald-600">
        Merci pour votre message. Nous vous recontacterons si nécessaire.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700">
          Votre message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Question, demande ou problème technique..."
          rows={4}
          required
          maxLength={2000}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700">
          Votre email (pour vous recontacter)
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
        />
      </div>
      <TurnstileWidget onVerify={onTurnstileVerify} size="compact" />
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-xl bg-sky-600 px-5 py-2.5 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
      >
        {status === "loading" ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
