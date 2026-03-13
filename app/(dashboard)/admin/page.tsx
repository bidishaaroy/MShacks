import { AppShell } from "@/components/layout/app-shell";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { AdminTaskList } from "@/components/forms/admin-task-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepository } from "@/lib/data/repository";
import { requireSession } from "@/lib/rbac";

export default async function AdminPage() {
  await requireSession(["ADMIN"]);
  const data = await getRepository().getDashboardData();

  return (
    <AppShell
      role="ADMIN"
      data={data}
      rightPanel={
        <>
          <DisclaimerBanner />
          <Card>
            <CardHeader>
              <CardTitle>Onboarding checklist</CardTitle>
              <CardDescription>Admin-safe operational tasks only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="rounded-[24px] bg-slate-50 p-4">Verify pharmacy contact on file</div>
              <div className="rounded-[24px] bg-slate-50 p-4">Confirm follow-up scheduling preferences</div>
              <div className="rounded-[24px] bg-slate-50 p-4">Send clinic FAQ summary after callback</div>
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Intake queue</CardTitle>
            <CardDescription>Non-clinical follow-up items needing action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.escalations.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <Badge variant={item.requiresDoctorReview ? "warning" : "default"}>{item.riskLevel}</Badge>
                <p className="mt-3 text-sm text-slate-700">{item.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduling support</CardTitle>
            <CardDescription>Placeholder MVP module for appointment operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-[24px] bg-slate-50 p-4">Next doctor review slot: March 15, 2026 at 10:30 AM</div>
            <div className="rounded-[24px] bg-slate-50 p-4">AI suggestion: offer callback before noon if patient reports worsening cough</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI admin suggestions</CardTitle>
            <CardDescription>Operational guidance generated within clinic SOPs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="rounded-[24px] bg-slate-50 p-4">Send callback confirmation when escalation remains open longer than 2 hours.</div>
            <div className="rounded-[24px] bg-slate-50 p-4">Bundle intake clarification with pharmacy check to reduce duplicate outreach.</div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-4 flex-1">
        <CardHeader>
          <CardTitle>Admin task board</CardTitle>
          <CardDescription>AI-suggested callbacks and follow-up tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminTaskList tasks={data.adminTasks} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
