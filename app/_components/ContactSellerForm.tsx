"use client";

import { useState } from "react";

export function ContactSellerForm({
  listingId,
  listingTitle,
  contactEmail,
}: {
  listingId: string;
  listingTitle: string;
  contactEmail: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("sending");

    if (contactEmail) {
      const subject = encodeURIComponent(`Annonce: ${listingTitle}`);
      const body = encodeURIComponent(
        `Bonjour,\n\nJe vous contacte au sujet de votre annonce "${listingTitle}".\n\n${message}\n\nCordialement,\n${name}\n${email}`
      );
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      setStatus("sent");
      return;
    }

    try {
      const res = await fetch(`/api/listings/${listingId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-900">Contacter le vendeur</h3>
      {contactEmail ? (
        <p className="mt-1 text-sm text-slate-600">
          Remplissez le formulaire : votre client mail s’ouvrira avec un message pré-rempli.
        </p>
      ) : (
        <p className="mt-1 text-sm text-slate-600">
          Envoyez votre message au vendeur. Il pourra vous recontacter par email.
        </p>
      )}

      {status === "sent" ? (
        <p className="mt-4 text-sm font-medium text-emerald-700">
          {contactEmail ? "Vérifiez votre logiciel de messagerie pour envoyer l’email." : "Message envoyé. Le vendeur vous recontactera."}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Votre nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Votre email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-red-600">L’envoi a échoué. Réessayez ou contactez le vendeur par les coordonnées affichées.</p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-70 transition"
          >
            {status === "sending" ? "Envoi…" : "Envoyer le message"}
          </button>
        </form>
      )}
    </div>
  );
}
