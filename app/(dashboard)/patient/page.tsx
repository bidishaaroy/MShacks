import { AppShell } from "@/components/layout/app-shell";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepository } from "@/lib/data/repository";
import { requireSession } from "@/lib/rbac";

export default async function PatientPage() {
  await requireSession(["PATIENT"]);
  const data = await getRepository().getDashboardData();

  return (
    <AppShell
      role="PATIENT"
      data={data}
      rightPanel={
        <>
          <DisclaimerBanner />
          <Card>
            <CardHeader>
              <CardTitle>Care plan summary</CardTitle>
              <CardDescription>Current doctor-authored guidance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Treatment plan</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{data.carePlan.treatmentPlan}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Watch for</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.carePlan.escalationThresholdsJson.redFlags.map((flag) => (
                    <Badge key={flag} variant="warning">
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="destructive" className="w-full">
                Escalate to clinic
              </Button>
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Patient workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Ask about your plan, upload symptoms, or request clinic follow-up.</h1>
        </div>
      </div>
      <ChatWorkspace
        patientId={data.patient.id}
        conversationId={data.conversation.id}
        role="PATIENT"
        messages={data.messages}
      />
    </AppShell>
  );
}
