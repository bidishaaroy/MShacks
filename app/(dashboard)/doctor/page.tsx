import { AppShell } from "@/components/layout/app-shell";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { CarePlanForm } from "@/components/forms/care-plan-form";
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
          <DisclaimerBanner />
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
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Latest media</p>
              <p className="mt-3 text-sm text-slate-700">{data.uploads[0]?.blobUrl ?? "No media uploaded"}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Assistant summary</p>
              <p className="mt-3 text-sm text-slate-700">
                The patient is asking mostly care-plan clarification questions; medication advice requests continue to escalate.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Safety status</CardTitle>
            <CardDescription>Guardrails and escalation thresholds currently applied to this patient.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DisclaimerBanner />
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Doctor review triggers</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {data.carePlan.escalationThresholdsJson.doctorReviewTriggers.map((trigger) => (
                  <li key={trigger}>{trigger}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4 flex-1">
        <CardHeader>
          <CardTitle>Care-plan editor</CardTitle>
          <CardDescription>Doctor-authored instructions are the first priority in every patient-facing AI response.</CardDescription>
        </CardHeader>
        <CardContent>
          <CarePlanForm carePlan={data.carePlan} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
