import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AppointmentCalendar } from "@/components/forms/appointment-calendar";
import { AppointmentScheduler } from "@/components/forms/appointment-scheduler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export default async function SchedulePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await getRepository().getDashboardData();
  const patientName = data.users.find((user) => user.role === "PATIENT")?.name ?? "Assigned patient";

  return (
    <AppShell role={session.role} data={data}>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{session.role === "PATIENT" ? "Schedule your appointment" : "Appointment calendar"}</CardTitle>
            <CardDescription>
              {session.role === "PATIENT"
                ? "Choose a date and time for clinic review or follow-up."
                : "Track who scheduled each visit, upcoming reviews, and urgent escalations."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar appointments={data.appointments} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{session.role === "DOCTOR" ? "Add doctor review slot" : session.role === "ADMIN" ? "Create clinic appointment" : "Request follow-up time"}</CardTitle>
            <CardDescription>
              {session.role === "DOCTOR"
                ? "Add a review slot for a patient and keep scheduling coordinated."
                : session.role === "ADMIN"
                  ? "Use urgent slots for escalations and standard slots for routine follow-up."
                  : "Your request is sent into the clinic scheduling workflow."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Patient</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{patientName}</p>
              {session.role !== "PATIENT" ? (
                <div className="mt-3">
                  <Badge variant="warning">Escalations can be scheduled as urgent</Badge>
                </div>
              ) : null}
            </div>
            <AppointmentScheduler
              patientId={data.patient.id}
              role={session.role}
              assignedTo="Dr. Maya Lin"
              defaultReason={session.role === "PATIENT" ? "Patient requested follow-up appointment" : "Clinic review appointment"}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
