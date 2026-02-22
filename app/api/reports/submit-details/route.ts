import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

const Schema = z.object({
  manageToken: z.string().min(10),
  reportId: z.string().min(1),
  vin: z.string().min(1, "VIN requis"),
  marque: z.string().min(1, "Marque requise"),
  modele: z.string().min(1, "Modèle requis"),
  phone: z.string().min(1, "Téléphone requis"),
  email: z.string().email("Email invalide"),
});

const REPORT_REQUEST_TO_EMAILS = ["candel.pro@hotmail.com", "candel.s@hotmail.fr"] as const;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { manageToken, reportId, vin, marque, modele, phone, email } = parsed.data;

  const report = await prisma.listingReport.findFirst({
    where: { id: reportId },
    include: { listing: { select: { manageToken: true, title: true } } },
  });

  if (!report || report.listing.manageToken !== manageToken) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (report.status !== "PAID_AWAITING_UPLOAD") {
    return NextResponse.json({ error: "REPORT_NOT_PENDING" }, { status: 400 });
  }

  const detailsSubmittedAt = new Date().toISOString();
  const reportJson = {
    detailsSubmittedAt,
    marque,
    modele,
    phone,
    email,
  };

  await prisma.listingReport.update({
    where: { id: reportId },
    data: { vin, reportJson: reportJson as object },
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL ?? "AuTrust Rapports <onboarding@resend.dev>";
    const subject = `[AuTrust] Demande rapport CarVertical — ${marque} ${modele} (VIN: ${vin})`;
    const html = `
      <p>Une demande de rapport d'historique véhicule a été soumise après paiement.</p>
      <ul>
        <li><strong>VIN:</strong> ${vin}</li>
        <li><strong>Marque:</strong> ${marque}</li>
        <li><strong>Modèle:</strong> ${modele}</li>
        <li><strong>Téléphone:</strong> ${phone}</li>
        <li><strong>Email:</strong> ${email}</li>
      </ul>
      <p>Annonce liée: ${report.listing.title}</p>
      <p>Rapport ID: ${reportId}</p>
      <p>Merci d'envoyer le rapport à l'utilisateur sous 24 h.</p>
    `;
    try {
      await resend.emails.send({
        from,
        to: [...REPORT_REQUEST_TO_EMAILS],
        subject,
        html,
      });
    } catch (err) {
      console.error("Resend error:", err);
      // Don't fail the request: data is saved, user saw success
    }
  }

  return NextResponse.json({ ok: true });
}
