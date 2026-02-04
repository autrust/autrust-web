import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });

  const manageToken = String(form.get("manageToken") ?? "");
  const reportId = String(form.get("reportId") ?? "");
  const file = form.get("file");

  if (!manageToken || !reportId || !(file instanceof File)) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const report = await prisma.listingReport.findUnique({
    where: { id: reportId },
    include: { listing: { select: { manageToken: true } } },
  });

  if (!report || report.listing.manageToken !== manageToken) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (report.status !== "PAID_AWAITING_UPLOAD" && report.status !== "READY") {
    return NextResponse.json({ error: "NOT_PAID" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buf = Buffer.from(bytes);

  const dir = path.join(process.cwd(), "public", "reports");
  await fs.mkdir(dir, { recursive: true });

  const safeName = `${reportId}.pdf`;
  const abs = path.join(dir, safeName);
  await fs.writeFile(abs, buf);

  const url = `/reports/${safeName}`;

  const updated = await prisma.listingReport.update({
    where: { id: reportId },
    data: { reportUrl: url, status: "READY" },
  });

  return NextResponse.json({ ok: true, report: updated });
}

