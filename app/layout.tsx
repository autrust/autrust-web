import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/app/_components/SiteHeader";
import { getSiteUrl } from "@/lib/siteUrl";
import { JsonLd } from "@/app/_components/JsonLd";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AuTrust — Voiture neuve et d'occasion, achat et location",
    template: "%s • AuTrust",
  },
  description:
    "Trouvez votre voiture neuve ou d'occasion sur AuTrust. Annonces de véhicules (auto, moto, utilitaire) à l'achat et à la location. Comparer les prix, contacter les vendeurs.",
  keywords: [
    "voiture neuve",
    "voiture d'occasion",
    "achat voiture",
    "vente voiture",
    "location voiture",
    "annonces auto",
    "véhicule occasion",
    "auto occasion",
    "moto occasion",
    "utilitaire occasion",
  ],
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: siteUrl,
    siteName: "AuTrust",
    title: "AuTrust — Voiture neuve et d'occasion, achat et location",
    description:
      "Trouvez votre voiture neuve ou d'occasion. Annonces véhicules à l'achat et à la location.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AuTrust — Voiture neuve et d'occasion",
    description: "Annonces de véhicules à l'achat et à la location.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: siteUrl },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AuTrust",
  url: siteUrl,
  description:
    "Plateforme d'achat, vente et location de véhicules : voitures neuves et d'occasion, motos, utilitaires.",
  potentialAction: {
    "@context": "https://schema.org",
    "@type": "SearchAction",
    target: { "@context": "https://schema.org", "@type": "EntryPoint", urlTemplate: `${siteUrl}/listings?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AuTrust",
  url: siteUrl,
  description: "Voiture neuve et d'occasion — achat et location de véhicules",
  inLanguage: "fr-BE",
  potentialAction: {
    "@context": "https://schema.org",
    "@type": "SearchAction",
    target: { "@context": "https://schema.org", "@type": "EntryPoint", urlTemplate: `${siteUrl}/listings?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className="antialiased text-slate-900"
      >
        <JsonLd data={[jsonLdOrganization, jsonLdWebSite]} />
        <SiteHeader />
        {children}
        <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-600">
            © 2026 AuTrust — Auto • Moto • Utilitaire
          </div>
        </footer>
      </body>
    </html>
  );
}
