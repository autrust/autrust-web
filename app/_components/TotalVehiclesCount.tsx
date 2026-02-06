import { prisma } from "@/lib/db";

export async function TotalVehiclesCount() {
  const total = await prisma.listing
    .count({
      where: { status: "ACTIVE" },
    })
    .catch(() => 0);

  return (
    <span className="text-xs text-slate-500">
      {total.toLocaleString("fr-BE")} véhicule{total > 1 ? "s" : ""}
    </span>
  );
}
