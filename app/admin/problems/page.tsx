import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Problèmes signalés",
};

export default async function AdminProblemsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/problems");
  if (!isAdmin(user)) redirect("/account?admin=verify_phone");

  let problems: { id: string; message: string; email: string | null; pageUrl: string | null; createdAt: Date }[] = [];
  try {
    problems = await prisma.problemReport.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Modèle ou table absents (Prisma non régénéré / migration non appliquée)
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Administration
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Problèmes signalés</h1>
        <p className="mt-2 text-slate-600">
          {problems.length} signalement{problems.length !== 1 ? "s" : ""} reçu
          {problems.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-6 space-y-4">
          {problems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-6 text-center text-slate-600">
              Aucun problème signalé pour le moment.
            </div>
          ) : (
            problems.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                  {p.message}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {p.email && (
                    <span>
                      Contact :{" "}
                      <a
                        href={`mailto:${p.email}`}
                        className="text-sky-600 hover:underline"
                      >
                        {p.email}
                      </a>
                    </span>
                  )}
                  {p.pageUrl && (
                    <span className="truncate max-w-md" title={p.pageUrl}>
                      Page :{" "}
                      <a
                        href={p.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:underline"
                      >
                        {p.pageUrl}
                      </a>
                    </span>
                  )}
                  <time>
                    {p.createdAt.toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
