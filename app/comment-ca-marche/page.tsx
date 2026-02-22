import Link from "next/link";
import { cookies } from "next/headers";
import { getLocaleFromCookie, LOCALE_COOKIE } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";

export async function generateMetadata() {
  const c = await cookies();
  const locale = getLocaleFromCookie(c.get(LOCALE_COOKIE)?.value);
  const t = getTranslations(locale);
  return {
    title: `${t.menu.howItWorks} | AuTrust`,
    description:
      locale === "fr"
        ? "Découvrez comment acheter et vendre un véhicule en toute confiance sur AuTrust : vendeurs vérifiés, acompte sécurisé, transparence VIN."
        : locale === "nl"
          ? "Ontdek hoe u met vertrouwen een voertuig koopt en verkoopt op AuTrust: geverifieerde verkopers, beveiligd voorschot, VIN-transparantie."
          : locale === "de"
            ? "Erfahren Sie, wie Sie mit Vertrauen ein Fahrzeug auf AuTrust kaufen und verkaufen: verifizierte Verkäufer, sichere Anzahlung, FIN-Transparenz."
            : "Find out how to buy and sell a vehicle with confidence on AuTrust: verified sellers, secure deposit, VIN transparency.",
  };
}

export default async function CommentCaMarchePage() {
  const c = await cookies();
  const locale = getLocaleFromCookie(c.get(LOCALE_COOKIE)?.value);
  const t = getTranslations(locale);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-20">
        <div className="rounded-3xl border bg-white/70 backdrop-blur-md p-8 sm:p-12 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t.home.howItWorksBadge}
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            {t.home.howItWorksTitle}
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
            {t.home.howItWorksIntro}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-emerald-700 transition"
            >
              {t.home.exploreVehicles}
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              {t.common.postAd}
            </Link>
          </div>

          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap gap-2">
            <Chip>{t.home.verifiedSellers}</Chip>
            <Chip>{t.home.secureDeposit}</Chip>
            <Chip>{t.home.vinTransparency}</Chip>
            <Chip>{t.home.partnerGarages}</Chip>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sellers */}
          <Card
            title={t.home.forSellers}
            subtitle={t.home.forSellersDesc}
            badge={t.home.seller}
          >
            <Steps>
              <Step n="1" title={t.home.step1SellerTitle} text={t.home.step1SellerText} />
              <Step n="2" title={t.home.step2SellerTitle} text={t.home.step2SellerText} />
              <Step n="3" title={t.home.step3SellerTitle} text={t.home.step3SellerText} />
              <Step n="4" title={t.home.step4SellerTitle} text={t.home.step4SellerText} />
            </Steps>
          </Card>

          {/* Buyers */}
          <Card
            title={t.home.forBuyers}
            subtitle={t.home.forBuyersDesc}
            badge={t.home.buyer}
          >
            <Steps>
              <Step n="1" title={t.home.step1BuyerTitle} text={t.home.step1BuyerText} />
              <Step n="2" title={t.home.step2BuyerTitle} text={t.home.step2BuyerText} />
              <Step n="3" title={t.home.step3BuyerTitle} text={t.home.step3BuyerText} />
              <Step n="4" title={t.home.step4BuyerTitle} text={t.home.step4BuyerText} />
            </Steps>

            <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{t.home.tipTitle}</p>
              <p className="mt-1">{t.home.tipText}</p>
            </div>
          </Card>
        </div>

        {/* CTA strip */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t.home.ctaTitle}</h2>
            <p className="mt-1 text-slate-600">{t.home.ctaSubtitle}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              {t.home.createAccount}
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
            >
              {t.home.iAmSeller}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-slate-600">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-600/10 text-sky-700 border border-sky-200 px-3 py-1 text-sm font-medium">
          {badge}
        </span>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Step({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
        {n}
      </span>
      <div>
        <h3 className="font-medium text-slate-900">{title}</h3>
        <p className="mt-0.5 text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
