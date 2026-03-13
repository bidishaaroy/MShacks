import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { carePlanSchema } from "@/lib/validators/forms";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = carePlanSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repository = getRepository();
  const carePlan = await repository.updateCarePlan({
    ...parsed.data
  });

  await repository.saveAuditEvent({
    actorType: "DOCTOR",
    actorId: session.userId,
    action: "CARE_PLAN_UPDATED",
    metadataJson: {
      patientId: parsed.data.patientId
    }
  });

  return NextResponse.json({ ok: true, carePlan });
}
