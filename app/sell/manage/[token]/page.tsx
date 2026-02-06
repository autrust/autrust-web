import { prisma } from "@/lib/db";
import { ManageReport } from "@/app/sell/manage/[token]/ManageReport";
import { SponsorButton } from "@/app/sell/manage/[token]/SponsorButton";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ManageListingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const listing = await prisma.listing.findFirst({
    where: { manageToken: token },
    select: {
      id: true,
      sellerId: true,
      isSponsored: true,
      sponsoredUntil: true,
      reports: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          provider: true,
          country: true,
          vin: true,
          reportUrl: true,
          amountCents: true,
          currency: true,
          errorMessage: true,
        },
      },
    },
  });

  if (!listing) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Lien vendeur invalide</h1>
          <p className="mt-2 text-slate-600">Ce lien n’existe pas (ou n’est plus valide).</p>
        </div>
      </main>
    );
  }

  if (listing.sellerId && listing.sellerId !== user.id) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-slate-600">
            Cette annonce est liée à un autre compte vendeur.
          </p>
        </div>
      </main>
    );
  }

  // Migration progressive: si l’annonce n’est pas encore liée à un compte, on la lie au compte courant.
  if (!listing.sellerId) {
    await prisma.listing.update({ where: { id: listing.id }, data: { sellerId: user.id } });
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Gérer l’annonce</h1>
        <p className="mt-2 text-slate-600">
          Gestion liée à ton compte vendeur.
        </p>

        <div className="mt-6 space-y-6">
          <SponsorButton 
            manageToken={token} 
            isSponsored={listing.isSponsored ?? false}
            sponsoredUntil={listing.sponsoredUntil}
          />
          
          <ManageReport
            manageToken={token}
            listingId={listing.id}
            existingReports={listing.reports.map((r) => ({
              id: r.id,
              status: r.status,
              provider: r.provider,
              country: r.country,
              vin: r.vin,
              reportUrl: r.reportUrl,
              amountCents: r.amountCents,
              currency: r.currency,
              errorMessage: r.errorMessage,
            }))}
          />
        </div>
      </div>
    </main>
  );
}

