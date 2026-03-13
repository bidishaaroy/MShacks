import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import type { Role } from "@/lib/types";

export async function requireSession(requiredRoles?: Role[]) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (requiredRoles && !requiredRoles.includes(session.role)) {
    redirect(getDashboardPath(session.role));
  }

  return session;
}

export function getDashboardPath(role: Role) {
  switch (role) {
    case "DOCTOR":
      return "/doctor";
    case "ADMIN":
      return "/admin";
    case "PATIENT":
      return "/patient";
  }
}
