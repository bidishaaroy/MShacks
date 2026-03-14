import { AppShell } from "@/components/layout/app-shell";
import { EscalateButton } from "@/components/chat/escalate-button";
import { QuickConditionPrompts } from "@/components/chat/quick-condition-prompts";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
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
          <Card>
            <CardHeader>
              <CardTitle>Care plan summary</CardTitle>
              <CardDescription>Current doctor-authored guidance and scheduling support.</CardDescription>
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
              <EscalateButton patientId={data.patient.id} conversationId={data.conversation.id} />
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Patient workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Secure messaging and scheduling with your clinic team.</h1>
        </div>
      </div>
      <div className="mb-4">
        <QuickConditionPrompts patientId={data.patient.id} conversationId={data.conversation.id} />
      </div>
      <ChatWorkspace
        patientId={data.patient.id}
        conversationId={data.conversation.id}
        role="PATIENT"
        messages={data.messages}
        placeholder="Ask Clin AI Bot about your care plan or scheduling"
        helperText="Choose a preset condition above or ask about your plan, follow-up, or clinic scheduling."
      />
    </AppShell>
  );
}
