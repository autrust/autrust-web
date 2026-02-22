import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting simple en mémoire (pour dev/test)
// En production, utilise Upstash Redis ou similaire
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  const path = req.nextUrl.pathname;
  return `${ip}:${path}`;
}

/** Endpoints JSON-only (POST) : refuser form-urlencoded pour limiter la surface CSRF. */
const JSON_ONLY_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/problem-report",
  "/api/plans/change",
];
function isJsonOnlyPath(pathname: string): boolean {
  return JSON_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Nettoyer les anciennes entrées toutes les 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting pour les endpoints sensibles
  if (pathname.startsWith("/api/auth/login")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/api/auth/register")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop d'inscriptions. Réessayez dans 1 heure." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/api/auth/phone/send-otp")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop de demandes. Réessayez dans 1 heure." },
        { status: 429 }
      );
    }
  }

  if (pathname.startsWith("/api/photos/upload")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop d'uploads. Réessayez dans 1 heure." },
        { status: 429 }
      );
    }
  }

  // Rate limit : création d'annonces
  if (request.method === "POST" && pathname === "/api/listings") {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 15, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop d'annonces créées. Réessayez dans 1 heure." },
        { status: 429 }
      );
    }
  }

  // Rate limit : formulaire contact / signalement
  if (pathname.startsWith("/api/problem-report")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop de messages. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }
  }

  // Rate limit : checkouts (paiements)
  if (pathname.startsWith("/api/deposits/checkout") || pathname.startsWith("/api/sponsor/checkout")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 30, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      );
    }
  }
  if (pathname.startsWith("/api/plans/change")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop de changements. Réessayez dans 1 heure." },
        { status: 429 }
      );
    }
  }
  if (pathname.startsWith("/api/reports/checkout")) {
    const key = getRateLimitKey(request);
    if (!checkRateLimit(key, 20, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: "TOO_MANY_REQUESTS", message: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      );
    }
  }

  // POST JSON-only : refuser Content-Type non-JSON pour réduire la surface CSRF
  if (request.method === "POST" && isJsonOnlyPath(pathname)) {
    const ct = request.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return NextResponse.json(
        { error: "INVALID_CONTENT_TYPE", message: "Content-Type application/json requis." },
        { status: 415 }
      );
    }
  }

  // Headers de sécurité
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.supabase.co https://challenges.cloudflare.com; frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com;"
  );

  // Autres headers de sécurité
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // HSTS (en production uniquement)
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

// Appliquer les headers de sécurité à tout le site ; rate limit uniquement sur les APIs listées.
export const config = {
  matcher: [
    "/api/auth/:path*",
    "/api/photos/:path*",
    "/api/kyc/:path*",
    "/api/reports/:path*",
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
