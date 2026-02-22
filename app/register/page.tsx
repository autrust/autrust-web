import { redirect } from "next/navigation";

export const metadata = {
  title: "Créer un compte",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? params.redirect ?? "";
  redirect(next ? `/auth?tab=signup&next=${encodeURIComponent(next)}` : "/auth?tab=signup");
}
