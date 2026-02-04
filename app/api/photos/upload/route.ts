import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILES = 15;
const MAX_BYTES = 10 * 1024 * 1024; // 10MB par photo (MVP)

function extFromMime(mime: string) {
  const m = mime.toLowerCase();
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  return undefined;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "NO_FILES" }, { status: 400 });
  if (files.length > MAX_FILES) return NextResponse.json({ error: "TOO_MANY_FILES" }, { status: 400 });

  for (const f of files) {
    if (!f.type.startsWith("image/")) {
      return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    }
    if (f.size > MAX_BYTES) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }
    if (!extFromMime(f.type)) {
      return NextResponse.json({ error: "UNSUPPORTED_IMAGE_FORMAT" }, { status: 400 });
    }
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });

  const urls: string[] = [];
  for (const f of files) {
    const ext = extFromMime(f.type)!;
    const id = randomUUID();
    const safeName = `${id}.${ext}`;
    const abs = path.join(dir, safeName);
    await fs.writeFile(abs, Buffer.from(await f.arrayBuffer()));
    urls.push(`/uploads/${safeName}`);
  }

  return NextResponse.json({ ok: true, urls });
}

