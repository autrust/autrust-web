"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    return `/listings?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination des annonces"
    >
      {currentPage > 1 ? (
        <Link
          href={buildHref(prevPage)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 transition"
        >
          ← Précédent
        </Link>
      ) : (
        <span className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-400 cursor-not-allowed">
          ← Précédent
        </span>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => {
            if (totalPages <= 7) return true;
            if (p === 1 || p === totalPages) return true;
            if (Math.abs(p - currentPage) <= 1) return true;
            return false;
          })
          .map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsisBefore = prev !== undefined && p - prev > 1;
            return (
              <span key={p} className="flex items-center gap-1">
                {showEllipsisBefore && <span className="px-1 text-slate-400">…</span>}
                {p === currentPage ? (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-300 bg-sky-50 text-sm font-medium text-sky-800"
                    aria-current="page"
                  >
                    {p}
                  </span>
                ) : (
                  <Link
                    href={buildHref(p)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 transition"
                  >
                    {p}
                  </Link>
                )}
              </span>
            );
          })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={buildHref(nextPage)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 transition"
        >
          Suivant →
        </Link>
      ) : (
        <span className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm text-slate-400 cursor-not-allowed">
          Suivant →
        </span>
      )}
    </nav>
  );
}
