import { redirect } from "next/navigation";

export const metadata = {
  title: "Déposer une annonce",
};

export default function DeposerPage() {
  redirect("/sell");
}
