"use client";

import { useState, useEffect } from "react";
import { ReportProblemForm } from "./ReportProblemForm";
import { ChatWidget } from "./ChatWidget";

export function FloatingHelpBubbles() {
  const [aideOpen, setAideOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Ouvrir Aide ou Chat depuis le menu (événements personnalisés)
  useEffect(() => {
    function onOpenAide() {
      setAideOpen(true);
    }
    function onOpenChat() {
      setChatOpen(true);
    }
    window.addEventListener("openAide", onOpenAide);
    window.addEventListener("openChat", onOpenChat);
    return () => {
      window.removeEventListener("openAide", onOpenAide);
      window.removeEventListener("openChat", onOpenChat);
    };
  }, []);

  return (
    <>
      {/* Deux bulles fixes en bas à droite */}
      <div
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2"
        aria-label="Aide et Chat"
      >
        <button
          type="button"
          onClick={() => setAideOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2"
          aria-label="Aide — Envoyer un message à l'équipe"
          title="Aide"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
          aria-label="Chat — Parler à l'assistant IA"
          title="Chat"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      {/* Modal Aide */}
      {aideOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setAideOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">
              Envoyer un message à l&apos;équipe
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Décrivez votre demande ou le problème rencontré. L&apos;administrateur le recevra et vous recontactera si besoin.
            </p>
            <div className="mt-4">
              <ReportProblemForm
                pageUrl={typeof window !== "undefined" ? window.location.href : undefined}
                onClose={() => setAideOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Panneau Chat (contrôlé par ce composant) */}
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
