import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function getPlanLimits(plan: "START" | "PRO" | "ELITE" | "ENTERPRISE") {
  switch (plan) {
    case "START":
      return { min: 1, max: 14 };
    case "PRO":
      return { min: 15, max: 30 };
    case "ELITE":
      return { min: 31, max: 120 };
    case "ENTERPRISE":
      return { min: 120, max: 1000 };
  }
}

const BodySchema = z.object({
  profileType: z.enum(["PARTICULIER", "CONCESSIONNAIRE"]),
  vatNumber: z.string().trim().max(30).optional(),
  selectedPlan: z.enum(["START", "PRO", "ELITE", "ENTERPRISE"]).optional(),
  maxListings: z.coerce.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const data: {
    profileType: "PARTICULIER" | "CONCESSIONNAIRE";
    vatNumber?: string | null;
    selectedPlan?: "START" | "PRO" | "ELITE" | "ENTERPRISE" | null;
    maxListings?: number | null;
  } = {
    profileType: parsed.data.profileType,
  };
  if (parsed.data.profileType === "CONCESSIONNAIRE") {
    if (parsed.data.vatNumber !== undefined) {
      data.vatNumber = parsed.data.vatNumber?.trim() || null;
    }
    data.selectedPlan = parsed.data.selectedPlan || null;
    if (parsed.data.selectedPlan) {
      if (parsed.data.maxListings !== undefined && parsed.data.maxListings !== null) {
        const limits = getPlanLimits(parsed.data.selectedPlan);
        if (parsed.data.maxListings < limits.min || parsed.data.maxListings > limits.max) {
          return NextResponse.json(
            { error: "INVALID_LISTINGS_COUNT", message: `Le nombre d'annonces doit être entre ${limits.min} et ${limits.max} pour le pack ${parsed.data.selectedPlan}.` },
            { status: 400 }
          );
        }
        data.maxListings = parsed.data.maxListings;
      }
      // Si maxListings n'est pas fourni, on ne le modifie pas (garde la valeur actuelle)
    } else {
      data.maxListings = null;
    }
  } else {
    data.vatNumber = null;
    data.selectedPlan = null;
    data.maxListings = null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({ ok: true });
}
