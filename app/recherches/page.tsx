import { getCurrentUser, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SavedSearchClient } from "./SavedSearchClient";

export default async function RecherchesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/recherches");
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Mes recherches sauvegardées</h1>

      {savedSearches.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/75 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">
            Aucune recherche sauvegardée pour le moment
          </p>
          <p className="mt-2 text-slate-500">
            Sauvegarde tes critères de recherche depuis la page{" "}
            <Link href="/listings" className="text-sky-700 underline">
              Annonces
            </Link>{" "}
            pour recevoir des alertes sur les nouvelles annonces.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <SavedSearchClient key={search.id} search={search} />
          ))}
        </div>
      )}

      {savedSearches.length > 0 && savedSearches.length < 3 && (
        <div className="mt-6 text-sm text-slate-500">
          Tu peux sauvegarder jusqu&apos;à 3 recherches.{" "}
          <Link href="/listings" className="text-sky-700 underline">
            Créer une nouvelle recherche
          </Link>
        </div>
      )}
    </div>
  );
}
