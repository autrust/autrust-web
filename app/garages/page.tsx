import { prisma } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { GarageLogo } from "./GarageLogo";
import { UserRatings } from "@/app/_components/UserRatings";

export default async function GaragesPage() {
  // Récupérer les utilisateurs qui sont des garages partenaires vérifiés
  // Pour l'instant, on considère les utilisateurs avec KYC vérifié comme garages potentiels
  // Plus tard, on pourra ajouter un champ isPartnerGarage au modèle User
  const partnerGarages = await prisma.user.findMany({
    where: {
      kyc: {
        status: "VERIFIED",
      },
      // On pourrait ajouter un filtre supplémentaire ici pour les garages uniquement
    },
    include: {
      kyc: true,
      listings: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Garages partenaires vérifiés</h1>

      {partnerGarages.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/75 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Image
              src="/trust-garage-icon-v4.png"
              alt="Garage partenaire"
              width={64}
              height={64}
              className="h-12 w-12 object-contain"
            />
          </div>
          <p className="text-lg font-medium text-slate-700">
            Aucun garage partenaire pour le moment
          </p>
          <p className="mt-2 text-slate-500">
            Les garages partenaires vérifiés apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partnerGarages.map((garage) => (
            <div key={garage.id} className="relative">
              {/* Rectangle principal avec logo et nom agrandis */}
              <div className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-emerald-50 p-8 shadow-sm hover:shadow-md transition overflow-hidden min-h-[200px] flex flex-col items-center justify-center">
                {/* Logo du garage personnalisé */}
                <div className="mb-4">
                  <GarageLogo name={garage.email.split("@")[0]} size={120} />
                </div>

                {/* Nom du garage en grand */}
                <div className="flex items-center gap-3 mb-2">
                  <Image
                    src="/icon-verified-v2.png"
                    alt="Vérifié"
                    width={32}
                    height={32}
                    className="h-6 w-6 object-contain"
                  />
                  <h3 className="text-2xl font-bold text-slate-900">
                    {garage.email.split("@")[0]}
                  </h3>
                </div>

                {/* Informations de contact */}
                <div className="text-sm text-slate-600 text-center mb-4">
                  {garage.email}
                  {garage.phone && (
                    <>
                      <br />
                      {garage.phone}
                    </>
                  )}
                </div>

                {/* Nombre d'annonces */}
                {garage.listings.length > 0 && (
                  <div className="text-sm font-medium text-slate-700 mb-4">
                    {garage.listings.length} annonce{garage.listings.length > 1 ? "s" : ""} disponible{garage.listings.length > 1 ? "s" : ""}
                  </div>
                )}

                {/* Lien vers les annonces */}
                <div className="mt-auto pt-4 border-t border-slate-200/50 w-full">
                  <Link
                    href={`/listings?sellerId=${garage.id}`}
                    className="block text-center text-sm font-medium text-sky-700 hover:text-sky-800 underline hover:text-sky-900"
                  >
                    {garage.listings.length > 0
                      ? `Voir tout le stock →`
                      : "Voir le stock →"}
                  </Link>
                </div>
              </div>

              {/* Badge garage partenaire Autrust en dessous à droite du rectangle */}
              <div className="absolute -bottom-2 -right-2 z-10">
                <Image
                  src="/trust-garage-icon-v4.png"
                  alt="Garage partenaire Autrust"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain drop-shadow-lg"
                />
              </div>

              {/* Évaluations du garage */}
              <div className="mt-6">
                <UserRatings userId={garage.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
