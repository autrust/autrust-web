import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale";
import { getAppUrl } from "@/lib/stripe";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  let locale: Locale = "fr";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    locale = body.locale === "en" || body.locale === "fr" || body.locale === "nl" || body.locale === "de" ? body.locale : "fr";
  } else {
    const form = await req.formData().catch(() => null);
    const l = form?.get("locale");
    if (l === "en" || l === "fr" || l === "nl" || l === "de") locale = l;
  }

  const referer = req.headers.get("referer");
  let redirectUrl = "/";
  if (referer) {
    try {
      const refUrl = new URL(referer);
      const appUrl = getAppUrl();
      if (refUrl.origin === new URL(appUrl).origin) {
        redirectUrl = refUrl.pathname + refUrl.search;
      }
    } catch {
      // ignore invalid referer
    }
  }

  const c = await cookies();
  c.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: "lax",
  });

  return NextResponse.redirect(new URL(redirectUrl, getAppUrl()));
}
