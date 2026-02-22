"use client";

import { useEffect, useId, useRef, useState } from "react";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        "error-callback"?: () => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "compact";
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type Props = {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
};

export function TurnstileWidget({ onVerify, onExpire, theme = "light", size = "normal" }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerId = useId().replace(/:/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    const loadScript = () => {
      if (window.turnstile) {
        renderWidget();
        return;
      }
      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    };

    const renderWidget = () => {
      if (!window.turnstile || !ref.current) return;
      setLoaded(true);
      try {
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": onExpire,
          theme,
          size,
        });
      } catch (e) {
        console.error("[Turnstile] render error", e);
      }
    };

    loadScript();
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [siteKey, onVerify, onExpire, theme, size]);

  if (!siteKey) return null;

  return (
    <div className="flex justify-center">
      <div ref={ref} id={containerId} className="turnstile-container" />
      {!loaded && (
        <p className="text-xs text-slate-500">Chargement de la vérification anti-robot…</p>
      )}
    </div>
  );
}
