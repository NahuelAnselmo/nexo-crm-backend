import { createHash, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

const cookieName = "nexo_session";
const sessionDurationMs = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readCookie(request: Request) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  for (const cookie of cookies) {
    const [name, ...value] = cookie.trim().split("=");
    if (name === cookieName) return decodeURIComponent(value.join("="));
  }
  return undefined;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
    maxAge: sessionDurationMs,
  } as const;
}

export async function startSession(userId: string, response: Response) {
  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + sessionDurationMs),
    },
  });
  response.cookie(cookieName, token, cookieOptions());
}

export async function endSession(request: Request, response: Response) {
  const token = readCookie(request);
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  response.clearCookie(cookieName, {
    ...cookieOptions(),
    maxAge: undefined,
  });
}

export async function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const token = readCookie(request);
  if (!token) return response.status(401).json({ error: "Sesión requerida" });

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          memberships: {
            include: { organization: true },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    response.clearCookie(cookieName, cookieOptions());
    return response.status(401).json({ error: "La sesión venció" });
  }

  const membership = session.user.memberships[0];
  if (!membership) {
    return response
      .status(403)
      .json({ error: "El usuario no pertenece a una organización" });
  }

  response.locals.auth = {
    session,
    user: session.user,
    membership,
    organization: membership.organization,
  };
  next();
}
