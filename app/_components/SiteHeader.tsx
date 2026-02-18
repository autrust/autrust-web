import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import type { Locale } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";
import { SavedSearchesIcon } from "./SavedSearchesIcon";
import { SiteMenu } from "./SiteMenu";
import { TotalVehiclesCount } from "./TotalVehiclesCount";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();
  const t = getTranslations(locale);
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/75 backdrop-blur">
      <Link href="/" className="block w-full bg-white">
        <div className="relative h-20 w-full sm:h-28">
          <Image
            src="/autrust-banner-v5.png"
            alt="Autrust"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center w-full"
          />
        </div>
      </Link>

      <div className="border-t border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-2">
          <p className="text-center text-xs text-slate-500 mb-2">
            {t.common.verifiedSecureCertified}
          </p>
          <nav className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-1">
              <SiteMenu
                menuLinks={[
                  { href: "/", label: t.menu.home },
                  { href: "/#comment-ca-marche", label: t.menu.howItWorks },
                  { href: "/pourquoi-autrust", label: t.menu.whyAuTrust },
                  { href: "/securite-verification", label: t.menu.securityVerification },
                  { href: "/tarifs", label: t.common.pricing },
                  { href: "/listings", label: t.common.buy },
                  { href: "/location", label: t.common.rent },
                  { href: "/garages", label: t.menu.garages },
                  { href: "/sell", label: t.common.postAd },
                ]}
                openMenuAria={t.menu.openMenu}
                currentLocale={locale}
              />
              <Link
                href="/"
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-slate-900 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
                aria-label={t.header.homeAria}
              >
              <span className="inline-flex items-center">
                <Image
                  src="/logo-shield-autrust-v2.png"
                  alt="Autrust"
                  width={120}
                  height={120}
                  className="h-14 w-auto"
                />
              </span>
              <Suspense fallback={<span className="text-xs text-slate-300">...</span>}>
                <TotalVehiclesCount />
              </Suspense>
            </Link>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2">
            <Link
              href="/listings"
              className="rounded-xl px-3 py-2 text-sky-700 hover:bg-sky-50/80 hover:text-sky-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
            >
              {t.common.buy}
            </Link>
            <Link
              href="/location"
              className="rounded-xl px-3 py-2 text-sky-700 hover:bg-sky-50/80 hover:text-sky-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
            >
              {t.common.rent}
            </Link>
            {user ? (
              <>
                <Link
                  href="/favoris"
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-red-500 hover:bg-red-50 hover:border-red-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
                  aria-label={t.common.favorites}
                  title={t.common.favorites}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </Link>
                <SavedSearchesIcon />
                <Link
                  href="/account"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
                >
                  {t.common.myAccount}
                </Link>
                <form action="/api/auth/logout" method="POST" className="inline">
                  <button
                    type="submit"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
                  >
                    {t.common.logout}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/auth"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              >
                {t.common.login}
              </Link>
            )}
            <Link
              href="/sell"
              className="rounded-xl bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
            >
              {t.common.postAd}
            </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

