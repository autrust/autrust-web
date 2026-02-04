import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extFromMime(mime: string) {
  const m = mime.toLowerCase();
  if (m === "application/pdf") return "pdf";
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  return undefined;
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });

  const manageToken = String(form.get("manageToken") ?? "");
  const documentType = String(form.get("documentType") ?? "");
  const idDocument = form.get("idDocument");
  const selfie = form.get("selfie");

  if (!manageToken || !documentType || !(idDocument instanceof File)) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  if (documentType !== "id_card" && documentType !== "passport") {
    return NextResponse.json({ error: "INVALID_DOCUMENT_TYPE" }, { status: 400 });
  }

  // 10 MB max for each file (MVP)
  const maxBytes = 10 * 1024 * 1024;
  if (idDocument.size > maxBytes) {
    return NextResponse.json({ error: "ID_TOO_LARGE" }, { status: 400 });
  }
  if (selfie instanceof File && selfie.size > maxBytes) {
    return NextResponse.json({ error: "SELFIE_TOO_LARGE" }, { status: 400 });
  }

  const idExt = extFromMime(idDocument.type);
  if (!idExt) {
    return NextResponse.json({ error: "INVALID_ID_MIME" }, { status: 400 });
  }
  const selfieExt = selfie instanceof File ? extFromMime(selfie.type) : undefined;
  if (selfie instanceof File && (!selfieExt || selfie.type === "application/pdf")) {
    return NextResponse.json({ error: "INVALID_SELFIE_MIME" }, { status: 400 });
  }

  const listing = await prisma.listing.findFirst({
    where: { manageToken },
    select: { id: true },
  });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const dir = path.join(process.cwd(), "private_uploads", "kyc");
  await fs.mkdir(dir, { recursive: true });

  // upsert to get a stable id for file names
  const kyc = await prisma.listingKyc.upsert({
    where: { listingId: listing.id },
    create: {
      listingId: listing.id,
      documentType,
      status: "PENDING_REVIEW",
      idDocPath: "pending",
      idDocMime: idDocument.type,
      idDocOriginalName: idDocument.name,
    },
    update: {
      documentType,
      status: "PENDING_REVIEW",
      idDocMime: idDocument.type,
      idDocOriginalName: idDocument.name,
      selfieMime: selfie instanceof File ? selfie.type : undefined,
      selfieOriginalName: selfie instanceof File ? selfie.name : undefined,
    },
    select: { id: true },
  });

  const idDocAbs = path.join(dir, `${kyc.id}-id.${idExt}`);
  await fs.writeFile(idDocAbs, Buffer.from(await idDocument.arrayBuffer()));

  let selfieAbs: string | undefined;
  if (selfie instanceof File && selfieExt) {
    selfieAbs = path.join(dir, `${kyc.id}-selfie.${selfieExt}`);
    await fs.writeFile(selfieAbs, Buffer.from(await selfie.arrayBuffer()));
  }

  const updated = await prisma.listingKyc.update({
    where: { listingId: listing.id },
    data: {
      idDocPath: idDocAbs,
      selfiePath: selfieAbs,
    },
  });

  return NextResponse.json({
    ok: true,
    kyc: { id: updated.id, status: updated.status, documentType: updated.documentType },
  });
}

