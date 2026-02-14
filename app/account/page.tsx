import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PhoneVerificationClient } from "@/app/account/PhoneVerificationClient";
import { KycStartClient } from "@/app/account/KycStartClient";
import { ConnectStartClient } from "@/app/account/ConnectStartClient";
import { UserRatings } from "@/app/_components/UserRatings";
import { formatPriceEUR } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mon compte",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { kyc: true, stripe: true },
  });
  if (!dbUser) redirect("/auth?next=/account");

  const myListings = await prisma.listing.findMany({
    where: { sellerId: user.id },
    include: {
      _count: { select: { contactRequests: true, favorites: true } },
      photos: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const emailOk = Boolean(dbUser.emailVerifiedAt);
  const phoneOk = Boolean(dbUser.phoneVerifiedAt);

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Mon compte</h1>
        <p className="mt-2 text-slate-600">{dbUser.email}</p>

        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
          {!isAdmin(user) && (
            <>
              <div className="text-lg font-semibold">Statut</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs text-slate-500">Email</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {emailOk ? "Validé" : "Non validé"}
                  </div>
                  {!emailOk ? (
                    <div className="mt-2 text-sm text-slate-600">
                      <div>Clique sur le lien de validation (en dev: visible dans les logs).</div>
                      <form action="/api/auth/email/resend" method="POST" className="mt-3">
                        <button
                          type="submit"
                          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                        >
                          Renvoyer le lien
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs text-slate-500">Téléphone</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {phoneOk ? "Vérifié" : "Non vérifié"}
                  </div>
                  {!phoneOk ? <PhoneVerificationClient /> : null}
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs text-slate-500">KYC</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {dbUser.kyc?.status === "VERIFIED"
                      ? "Vérifié"
                      : dbUser.kyc?.status === "REJECTED"
                        ? "Refusé"
                        : dbUser.kyc?.status === "PENDING_REVIEW"
                          ? "En cours"
                          : "Non démarré"}
                  </div>
                  {dbUser.kyc?.status === "VERIFIED" ? (
                    <div className="mt-2 text-sm text-slate-600">OK pour vendre et payer un acompte.</div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600">
                      Requis pour vendre et payer un acompte.
                      <KycStartClient />
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <div className="text-xs text-slate-500">IBAN (paiements)</div>
                  <div className="mt-1 font-medium text-slate-900">
                    {dbUser.stripe?.connectPayoutsEnabled
                      ? "Actif (paiements activés)"
                      : dbUser.stripe?.stripeConnectAccountId
                        ? "En cours (à compléter)"
                        : "Non configuré"}
                  </div>
                  {dbUser.stripe?.connectPayoutsEnabled ? (
                    <div className="mt-2 text-sm text-slate-600">OK pour recevoir des acomptes.</div>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600">
                      Requis pour recevoir des acomptes.
                      <ConnectStartClient />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className={`flex flex-wrap gap-3 ${!isAdmin(user) ? "mt-4" : ""}`}>
            <Link
              href="/sell"
              className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
            >
              Déposer une annonce
            </Link>
            <Link
              href="/account#mes-annonces"
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 font-medium text-sky-800 hover:bg-sky-100"
            >
              Mes annonces {myListings.length > 0 ? `(${myListings.length})` : ""}
            </Link>
            <Link
              href="/admin/feedback"
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
            >
              Avis site
            </Link>
            <Link
              href="/admin/users"
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
            >
              Utilisateurs
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-800 hover:bg-slate-50"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 text-sm text-slate-600">
          Lecture publique des annonces:{" "}
          <Link className="text-sky-700 underline" href="/listings">
            voir les annonces
          </Link>
        </div>

        {/* Tableau de bord vendeur : mes annonces */}
        <section id="mes-annonces" className="mt-10 scroll-mt-6">
          <h2 className="text-xl font-bold text-slate-900">Mes annonces</h2>
          <p className="mt-1 text-sm text-slate-600">
            Vos annonces, contacts reçus et favoris
          </p>
          {myListings.length > 0 ? (
            <div className="mt-4 space-y-4">
              {myListings.map((l) => (
                <Link
                  key={l.id}
                  href={`/listings/${l.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-sm hover:border-sky-300 hover:bg-sky-50/50 transition"
                >
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {l.photos[0] ? (
                      <Image
                        src={l.photos[0].url}
                        alt=""
                        width={96}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">{l.title}</div>
                    <div className="mt-0.5 text-sm text-slate-600">
                      {formatPriceEUR(l.price)}
                      {l.mode === "RENT" ? " / jour" : ""} • {l.year} • {l.km.toLocaleString("fr-BE")} km
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span>
                        {l._count.contactRequests} contact{l._count.contactRequests !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {l._count.favorites} favori{l._count.favorites !== 1 ? "s" : ""}
                      </span>
                      <span>
                        Publiée le {l.createdAt.toLocaleDateString("fr-BE")}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-sky-600 text-sm font-medium">
                    Voir l’annonce →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/75 p-6 text-center text-slate-600">
              <p>Vous n’avez pas encore déposé d’annonce.</p>
              <Link
                href="/sell"
                className="mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
              >
                Déposer une annonce
              </Link>
            </div>
          )}
        </section>

        {/* Évaluations reçues */}
        <div className="mt-8">
          <UserRatings userId={dbUser.id} />
        </div>
      </div>
    </main>
  );
}

