import { redirect } from "next/navigation";

export const metadata = {
  title: "Connexion",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? params.redirect ?? "";
  redirect(next ? `/auth?next=${encodeURIComponent(next)}` : "/auth");
}
