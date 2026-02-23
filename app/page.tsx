"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** Tranches d'heure pour la vidéo de fond. */
function getVideoSlot() {
  const h = new Date().getHours();
  if (h >= 6 && h < 8) return "sunrise"; // lever du soleil
  if (h >= 8 && h < 12) return "matin"; // matin
  if (h >= 12 && h < 18) return "jour"; // journée
  if (h >= 18 && h < 20) return "finJournee"; // fin de journée
  if (h >= 20 && h < 21) return "coucherSoleil"; // couché de soleil
  return "nuit"; // 21h–6h
}

const VIDEO_BY_SLOT: Record<string, string> = {
  sunrise: "/intro/sunrise.mp4",
  matin: "/intro/matin.mp4",
  jour: "/intro/jour.mp4",
  finJournee: "/intro/fin-journee.mp4",
  coucherSoleil: "/intro/coucher-soleil.mp4",
  nuit: "/intro/nuit.mp4",
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const slot = useMemo(() => (mounted ? getVideoSlot() : "sunrise"), [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const videoSrc = VIDEO_BY_SLOT[slot] ?? VIDEO_BY_SLOT.sunrise;

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-black">
      {/* Vidéo de fond — 6h-8h = lever du soleil */}
      {mounted && (
        <video
          key={slot}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Contenu */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center text-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/achat"
            className="rounded-2xl bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-emerald-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
          >
            Explorer les annonces
          </Link>
          <Link
            href="/deposer"
            className="rounded-2xl border border-white/30 bg-white/5 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
          >
            Déposer une annonce
          </Link>
        </div>
        <p className="mt-6 text-sm text-white/80">
          Achat / Vente / Location — Professionnel / Particulier
        </p>
      </div>
    </main>
  );
}
