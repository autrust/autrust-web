import { SellForm } from "@/app/sell/SellForm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Déposer une annonce",
};

export const dynamic = "force-dynamic";

export default async function SellPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { kyc: true },
  });
  if (!dbUser) redirect("/login");

  const okToSell =
    Boolean(dbUser.emailVerifiedAt) &&
    Boolean(dbUser.phoneVerifiedAt) &&
    dbUser.kyc?.status === "VERIFIED";

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Déposer une annonce</h1>
        <p className="mt-2 text-slate-600">
          Pour publier, le compte doit être vérifié (email + téléphone + KYC).
        </p>

        {okToSell ? (
          <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
            <SellForm />
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-amber-200/70 bg-amber-50/70 p-6 text-slate-800 shadow-sm backdrop-blur">
            <div className="text-sm font-semibold">Compte non vérifié</div>
            <div className="mt-2 text-sm text-slate-700">
              Va dans{" "}
              <Link className="text-sky-700 underline" href="/account">
                Mon compte
              </Link>{" "}
              puis valide: email, téléphone et KYC.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

