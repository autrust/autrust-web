import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import type { Locale } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";
import { IntroMenu } from "./IntroMenu";
import type { MenuItem } from "./SiteMenu";

export async function IntroHeader({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();
  const t = getTranslations(locale);

  const menuLinks: MenuItem[] = [
    { href: "/", label: t.menu.home },
    { href: "/#comment-ca-marche", label: t.menu.howItWorks },
    { href: "/pourquoi-autrust", label: t.menu.whyAuTrust },
    { href: "/securite-verification", label: t.menu.securityVerification },
    { href: "/tarifs", label: t.common.pricing },
    { action: "buyRent", labelBuy: t.common.buy, labelRent: t.common.rent },
    { href: "/garages", label: t.menu.garages },
    { href: "/sell", label: t.common.postAd },
    { action: "chatAide", labelChat: t.common.chat, labelAide: t.common.help },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-4 sm:px-6 py-4 bg-transparent">
      <div className="flex items-center gap-3">
        {user ? (
          <Link
            href="/account"
            className="hidden sm:inline-flex items-center rounded-lg border border-white/40 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            {t.common.myAccount}
          </Link>
        ) : (
          <Link
            href="/auth"
            className="hidden sm:inline-flex items-center rounded-lg border border-white/40 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
          >
            {t.intro.login}
          </Link>
        )}
        <IntroMenu
          menuLinks={menuLinks}
          openMenuAria={t.menu.openMenu}
          currentLocale={locale}
        />
      </div>
    </header>
  );
}
