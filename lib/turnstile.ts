/**
 * Vérification serveur des tokens Cloudflare Turnstile.
 * Si TURNSTILE_SECRET_KEY n'est pas défini, la vérification est skippée (dégradé gracieux).
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifyResult =
  | { success: true }
  | { success: false; errorCodes: string[] };

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: true };
  }

  if (!token || typeof token !== "string" || token.length > 2048) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  try {
    const body: Record<string, string> = {
      secret,
      response: token.trim(),
    };
    if (remoteIp && typeof remoteIp === "string") body.remoteip = remoteIp;

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (data.success) {
      return { success: true };
    }
    return {
      success: false,
      errorCodes: Array.isArray(data["error-codes"]) ? data["error-codes"] : ["unknown"],
    };
  } catch (err) {
    console.error("[turnstile] siteverify error", err);
    return { success: false, errorCodes: ["internal-error"] };
  }
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}
