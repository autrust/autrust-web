import type { Locale } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";

export function TrustBar({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);

  const items = [
    {
      label: t.intro.trustVerified,
      icon: (
        <svg
          className="h-6 w-6 text-amber-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      ),
    },
    {
      label: t.intro.trustVinHistory,
      icon: (
        <svg
          className="h-6 w-6 text-white/90 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      ),
    },
    {
      label: t.intro.trustSecureDeposit,
      icon: (
        <svg
          className="h-6 w-6 text-white/90 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      ),
    },
    {
      label: t.intro.trustDisputeSupport,
      icon: (
        <svg
          className="h-6 w-6 text-white/90 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      ),
    },
  ] as const;

  return (
    <section
      className="w-full bg-black/40 backdrop-blur-sm border-t border-white/10"
      aria-label={t.home.trustSection}
    >
      <div className="mx-auto max-w-6xl px-4 py-5 sm:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-center justify-items-center lg:justify-items-start">
          {items.map(({ label, icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 text-white"
            >
              {icon}
              <span className="text-sm font-medium text-white/95">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
