import { redirect } from "next/navigation";

export const metadata = {
  title: "Achat",
};

export default function AchatPage() {
  redirect("/listings");
}
