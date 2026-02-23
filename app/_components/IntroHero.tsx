import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";

export function IntroHero({ locale }: { locale: Locale }) {
  const t = getTranslations(locale);

  return (
    <section
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-24 overflow-hidden"
      aria-label="Hero"
    >
      {/* Background: dark gradient + optional overlay for depth */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 20%, rgba(30, 58, 95, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 50% 90%, rgba(15, 23, 42, 0.9) 0%, transparent 50%),
            linear-gradient(180deg, #05070c 0%, #0a0e17 40%, #0d1321 70%, #0f172a 100%)
          `,
        }}
      />

      {/* Title */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-[0.02em] text-white text-center uppercase">
        {t.intro.heroTitle}
      </h1>
      <p className="mt-4 sm:mt-5 text-lg sm:text-xl text-white/90 text-center max-w-xl">
        {t.intro.heroSubtitle}
      </p>

      {/* CTAs */}
      <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/listings"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-emerald-500 px-8 py-3.5 text-base font-medium text-white hover:bg-emerald-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c] min-w-[220px]"
        >
          {t.intro.exploreListings}
        </Link>
        <Link
          href="/sell"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-white/50 bg-transparent px-8 py-3.5 text-base font-medium text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070c] min-w-[220px]"
        >
          {t.intro.postAd}
        </Link>
      </div>
    </section>
  );
}
