"use client";

import { useState } from "react";

export function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" && url.startsWith("/")
    ? `${window.location.origin}${url}`
    : url;

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" && url.startsWith("/")
      ? `${window.location.origin}${url}`
      : url;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
          text: title,
        });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (href?: string) => {
    const toCopy =
      href ??
      (typeof window !== "undefined" && url.startsWith("/")
        ? `${window.location.origin}${url}`
        : url);
    navigator.clipboard.writeText(toCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 transition"
    >
      {copied ? (
        <>
          <span className="text-emerald-600">✓</span>
          Lien copié
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Partager cette annonce
        </>
      )}
    </button>
  );
}
