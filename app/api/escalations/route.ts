import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "DOCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getRepository().getDashboardData();
  return NextResponse.json({ escalations: data.escalations });
}
