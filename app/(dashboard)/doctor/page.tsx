import { AppShell } from "@/components/layout/app-shell";
import { AppointmentCalendar } from "@/components/forms/appointment-calendar";
import { DoctorCarePlanSwitcher } from "@/components/forms/doctor-care-plan-switcher";
import { DoctorThreadSwitcher } from "@/components/chat/doctor-thread-switcher";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepository } from "@/lib/data/repository";
import { requireSession } from "@/lib/rbac";
import { formatDateTime } from "@/lib/utils";

export default async function DoctorPage() {
  await requireSession(["DOCTOR"]);
  const data = await getRepository().getDashboardData();

  return (
    <AppShell
      role="DOCTOR"
      data={data}
      rightPanel={
        <>
          <Card>
            <CardHeader>
              <CardTitle>Escalation queue</CardTitle>
              <CardDescription>Latest AI-triggered items needing clinician attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.escalations.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={item.riskLevel === "CRITICAL" ? "danger" : "warning"}>{item.riskLevel}</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">{item.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Patient context</CardTitle>
            <CardDescription>{data.patient.summary}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Patient</p>
              <p className="mt-3 text-lg font-semibold text-slate-900">
                {data.users.find((user) => user.role === "PATIENT")?.name}
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Care plan status</p>
              <p className="mt-3 text-sm text-slate-700">
                Last saved {data.carePlan.lastUpdatedAt ? formatDateTime(data.carePlan.lastUpdatedAt) : "recently"}.
              </p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Assistant summary</p>
              <p className="mt-3 text-sm text-slate-700">
                {data.escalations[0]
                  ? `Latest escalation: ${data.escalations[0].reason}`
                  : "No active escalations. The assistant is currently handling routine clarification only."}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client panel</CardTitle>
            <CardDescription>Assigned patients and next review times.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.clientSummaries.map((client) => (
              <div key={client.id} className="rounded-[24px] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                  <Badge variant={client.status.includes("follow") ? "warning" : "success"}>{client.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{client.summary}</p>
                <p className="mt-2 text-xs text-slate-500">Next review {formatDateTime(client.nextReview)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4 flex-1">
        <CardHeader>
          <CardTitle>Care-plan editor</CardTitle>
          <CardDescription>
            Doctor-authored instructions are the first priority in every patient-facing AI response.
            {data.carePlan.lastUpdatedAt ? ` Last updated ${formatDateTime(data.carePlan.lastUpdatedAt)}.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DoctorCarePlanSwitcher carePlans={data.carePlanOptions} />
        </CardContent>
      </Card>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="min-h-[480px]">
          <CardHeader>
            <CardTitle>Patient conversations</CardTitle>
            <CardDescription>Switch between different patient threads and review how Clin AI Bot is supporting each case.</CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col">
            <DoctorThreadSwitcher threads={data.doctorThreads} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Upcoming follow-ups, escalated reviews, and scheduled patient appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar appointments={data.appointments} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
