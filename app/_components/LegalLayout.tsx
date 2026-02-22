import Link from "next/link";
import { LEGAL_ROUTES } from "@/lib/legal-content";

const links = [
  { href: LEGAL_ROUTES.termsPrivate, label: "CGU — Utilisateur privé" },
  { href: LEGAL_ROUTES.termsPro, label: "CGU — Professionnels" },
  { href: LEGAL_ROUTES.legalNotice, label: "Mentions légales" },
  { href: LEGAL_ROUTES.privacy, label: "Protection des données (RGPD)" },
  { href: LEGAL_ROUTES.cookies, label: "Cookies" },
  { href: LEGAL_ROUTES.accessibility, label: "Accessibilité" },
  { href: LEGAL_ROUTES.payments, label: "Paiement / acompte" },
  { href: LEGAL_ROUTES.reportHistory, label: "Rapports d'historique (CarVertical)" },
];

export function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[920px] px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 m-0">
          {title}
        </h1>
        <nav className="mt-3 flex flex-wrap gap-2.5">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-10 text-sm text-slate-500">
        © {new Date().getFullYear()} Autrust
      </footer>
    </div>
  );
}
