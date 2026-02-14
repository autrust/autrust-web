import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "autrust_session";

export type AuthUser = {
  id: string;
  email: string;
  emailVerifiedAt: Date | null;
  phone: string | null;
  phoneVerifiedAt: Date | null;
};

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export function isPasswordStrongEnough(pw: string) {
  // MVP simple: 8 chars min
  return pw.length >= 8;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30j

  await prisma.userSession.create({
    data: {
      id: tokenHash,
      userId,
      expiresAt,
    },
  });

  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = sha256Hex(token);
    await prisma.userSession.deleteMany({ where: { id: tokenHash } });
  }
  c.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const c = await cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256Hex(token);

  const session = await prisma.userSession.findUnique({
    where: { id: tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          emailVerifiedAt: true,
          phone: true,
          phoneVerifiedAt: true,
          isBlocked: true,
        },
      },
    },
  });
  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.userSession.deleteMany({ where: { id: tokenHash } });
    return null;
  }

  if (session.user.isBlocked) {
    await prisma.userSession.deleteMany({ where: { id: tokenHash } });
    const c = await cookies();
    c.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", expires: new Date(0) });
    return null;
  }

  const { isBlocked: _, ...user } = session.user;
  return user;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    // In server components, callers should redirect.
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

/** Retourne true si l'utilisateur est admin (email dans ADMIN_EMAILS). Bypass KYC, email, téléphone. */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  const admins = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? [];
  return admins.includes(user.email.toLowerCase());
}

export function constantTimeEquals(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

