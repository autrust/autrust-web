import { prisma } from "@/lib/db";

export async function getTotalVehiclesCount(): Promise<number> {
  return await prisma.listing
    .count({
      where: { status: "ACTIVE" },
    })
    .catch(() => 0);
}
