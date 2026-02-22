import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteHeader } from "./_components/SiteHeader";
import { SiteFooter } from "./_components/SiteFooter";
import { FloatingHelpBubbles } from "./_components/FloatingHelpBubbles";
import { getSiteUrl } from "@/lib/siteUrl";
import { getLocaleFromCookie, LOCALE_COOKIE } from "@/lib/locale";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const c = await cookies();
  const locale = getLocaleFromCookie(c.get(LOCALE_COOKIE)?.value);

  return (
    <html lang={locale}>
      <body
        className="antialiased text-slate-900 min-h-screen"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% -20%, rgba(147, 197, 253, 0.5), transparent 55%),
            linear-gradient(180deg, #bfdbfe 0%, #dbeafe 12%, #eff6ff 28%, #ffffff 45%, #ffffff 100%)
          `,
          backgroundAttachment: "fixed",
        }}
      >
        <SiteHeader locale={locale} />
        {children}
        <SiteFooter locale={locale} />
        <FloatingHelpBubbles />
      </body>
    </html>
  );
}
