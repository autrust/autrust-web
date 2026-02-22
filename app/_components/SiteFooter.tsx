import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { LEGAL_ROUTES } from "@/lib/legal-content";
import { getTranslations } from "@/lib/translations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ReportProblemButton } from "./ReportProblemButton";
import { ScrollToTop } from "./ScrollToTop";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);
  return (
    <footer className="border-t border-slate-200 bg-slate-50/90">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Intro */}
        <p className="text-base font-semibold text-slate-900 mb-8">
          {t.footer.intro}
        </p>

        {/* Columns + Contact & Haut */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* AuTrust */}
            <nav className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                {t.footer.autrust}
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><Link href="/pourquoi-autrust" className="hover:text-slate-900 underline underline-offset-2">{t.footer.about}</Link></li>
                <li><Link href="/pourquoi-autrust" className="hover:text-slate-900 underline underline-offset-2">{t.footer.press}</Link></li>
                <li><Link href={LEGAL_ROUTES.termsPrivate} className="hover:text-slate-900 underline underline-offset-2">{t.footer.terms}</Link></li>
                <li><Link href={LEGAL_ROUTES.legalNotice} className="hover:text-slate-900 underline underline-offset-2">{t.footer.legal}</Link></li>
                <li><Link href={LEGAL_ROUTES.privacy} className="hover:text-slate-900 underline underline-offset-2">{t.footer.privacy}</Link></li>
                <li><Link href={LEGAL_ROUTES.accessibility} className="hover:text-slate-900 underline underline-offset-2">{t.footer.accessibility}</Link></li>
              </ul>
            </nav>

            {/* Service */}
            <nav className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                {t.footer.service}
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><Link href="/contact" className="hover:text-slate-900 underline underline-offset-2">{t.footer.contactHelp}</Link></li>
                <li><Link href="/listings" className="hover:text-slate-900 underline underline-offset-2">{t.footer.listingsByBrand}</Link></li>
                <li><Link href="/listings" className="hover:text-slate-900 underline underline-offset-2">{t.footer.listingsByRegion}</Link></li>
              </ul>
            </nav>

            {/* Espace Pro */}
            <nav className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                {t.footer.proSpace}
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li><Link href="/tarifs" className="hover:text-slate-900 underline underline-offset-2">{t.common.pricing}</Link></li>
                <li><Link href="/auth" className="hover:text-slate-900 underline underline-offset-2">{t.common.login}</Link></li>
                <li><Link href="/auth" className="hover:text-slate-900 underline underline-offset-2">{t.common.signup}</Link></li>
                <li><Link href="/comment-ca-marche" className="hover:text-slate-900 underline underline-offset-2">{t.footer.helpInfo}</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 underline underline-offset-2">{t.common.contact}</Link></li>
              </ul>
            </nav>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-6">
            <ScrollToTop />
          </div>
        </div>

        {/* Contact + Apps + Social */}
        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t.common.contact}</h3>
            <p className="text-sm text-slate-600">
              <Link href="/contact" className="hover:text-slate-900 underline underline-offset-2">{t.footer.contactUs}</Link>
              {" · "}
              <Link href="/comment-ca-marche" className="hover:text-slate-900 underline underline-offset-2">{t.footer.howItWorks}</Link>
              {" · "}
              <ReportProblemButton />
            </p>
            {/* Social */}
            <div className="mt-4 flex items-center gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 hover:text-slate-900" aria-label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 hover:text-slate-900" aria-label="YouTube">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 hover:text-slate-900" aria-label="Instagram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 hover:bg-slate-300 hover:text-slate-900" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          {/* Country + Language */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{t.common.region} :</span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900">
                {t.common.belgium}
              </span>
            </div>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-600">
          <p>{t.footer.copyright}</p>
          <p className="text-slate-500">{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
