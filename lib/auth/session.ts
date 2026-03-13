import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";
import type { Role } from "@/lib/types";

const SESSION_COOKIE = "clinai_session";

interface SessionPayload {
  userId: string;
  role: Role;
  email: string;
}

function sign(value: string) {
  return createHmac("sha256", env.NEXTAUTH_SECRET).update(value).digest("hex");
}

export function encodeSession(payload: SessionPayload) {
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(serialized);
  return `${serialized}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [serialized, signature] = token.split(".");
  if (!serialized || !signature) {
    return null;
  }

  const expected = sign(serialized);
  if (signature.length !== expected.length) {
    return null;
  }

  const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!isValid) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(serialized, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? decodeSession(token) : null;
}

export async function setSession(payload: SessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE };
