"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type { Locale } from "@/lib/locale";
import { LanguageSwitcher } from "./LanguageSwitcher";

export type MenuItem =
  | { href: string; label: string }
  | { action: "aide" | "chat"; label: string }
  | { action: "chatAide"; labelChat: string; labelAide: string }
  | { action: "buyRent"; labelBuy: string; labelRent: string };

const defaultMenuLinks: MenuItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/pourquoi-autrust", label: "Pourquoi AuTrust" },
  { href: "/securite-verification", label: "Sécurité & vérification" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/listings", label: "Achat" },
  { href: "/location", label: "Location" },
  { href: "/garages", label: "Garages partenaires" },
  { href: "/sell", label: "Déposer une annonce" },
];

export function SiteMenu({
  menuLinks = defaultMenuLinks,
  openMenuAria = "Ouvrir le menu",
  currentLocale,
}: {
  menuLinks?: MenuItem[];
  openMenuAria?: string;
  currentLocale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
        aria-label={openMenuAria}
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {open && (
        <nav
          className="absolute left-0 top-full z-20 mt-1 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          {menuLinks.map((item, index) =>
            "href" in item ? (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                {item.label}
              </Link>
            ) : item.action === "chatAide" ? (
              <div
                key="chat-aide"
                role="menuitem"
                className="flex items-center gap-1 px-4 py-2.5 text-sm text-slate-700"
              >
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("openChat"));
                    setOpen(false);
                  }}
                  className="hover:text-slate-900 underline underline-offset-1"
                >
                  {item.labelChat}
                </button>
                <span className="text-slate-400">/</span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent("openAide"));
                    setOpen(false);
                  }}
                  className="hover:text-slate-900 underline underline-offset-1"
                >
                  {item.labelAide}
                </button>
              </div>
            ) : item.action === "buyRent" ? (
              <div
                key="buy-rent"
                role="menuitem"
                className="flex items-center gap-1 px-4 py-2.5 text-sm text-slate-700"
              >
                <Link
                  href="/listings"
                  onClick={() => setOpen(false)}
                  className="hover:text-slate-900 underline underline-offset-1"
                >
                  {item.labelBuy}
                </Link>
                <span className="text-slate-400">/</span>
                <Link
                  href="/location"
                  onClick={() => setOpen(false)}
                  className="hover:text-slate-900 underline underline-offset-1"
                >
                  {item.labelRent}
                </Link>
              </div>
            ) : (
              <button
                key={`${item.action}-${index}`}
                type="button"
                role="menuitem"
                onClick={() => {
                  if (item.action === "chat") window.dispatchEvent(new CustomEvent("openChat"));
                  else if (item.action === "aide") window.dispatchEvent(new CustomEvent("openAide"));
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                {item.label}
              </button>
            )
          )}
          {currentLocale != null && (
            <div className="mt-2 border-t border-slate-100 px-3 py-2">
              <LanguageSwitcher currentLocale={currentLocale} />
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
