import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Avis site",
};

export default async function AdminFeedbackPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/feedback");
  if (!isAdmin(user)) redirect("/account");

  const feedbacks = await prisma.siteFeedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/account"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Mon compte
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Avis site</h1>
        <p className="mt-2 text-slate-600">
          {feedbacks.length} avis reçus
        </p>

        <div className="mt-6 space-y-4">
          {feedbacks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-6 text-center text-slate-600">
              Aucun avis pour le moment.
            </div>
          ) : (
            feedbacks.map((f) => (
              <div
                key={f.id}
                className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    ★ {f.stars}/5
                  </span>
                  <time className="text-xs text-slate-500">
                    {f.createdAt.toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">
                  {f.message}
                </p>
                {f.email && (
                  <p className="mt-2 text-xs text-slate-500">
                    Contact : {f.email}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
