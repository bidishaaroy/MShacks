import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepository } from "@/lib/data/repository";
import { requireSession } from "@/lib/rbac";
import { formatDateTime } from "@/lib/utils";

export default async function AssistantPage() {
  const session = await requireSession(["DOCTOR", "ADMIN"]);
  const data = await getRepository().getDashboardData();

  return (
    <AppShell role={session.role} data={data}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assistant actions</CardTitle>
            <CardDescription>Every AI action remains attributable and reviewable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.escalations.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={item.riskLevel === "CRITICAL" ? "danger" : "warning"}>{item.riskLevel}</Badge>
                  <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">{item.reason}</p>
                <p className="mt-1 text-xs text-slate-500">Doctor review: {item.requiresDoctorReview ? "yes" : "no"} | Admin follow-up: {item.requiresAdminFollowup ? "yes" : "no"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>Assistant-triggered safety and workflow records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.messages
              .filter((message) => message.senderType === "AI")
              .map((message) => (
                <div key={message.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="default">AI response</Badge>
                    <span className="text-xs text-slate-500">{formatDateTime(message.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{message.content}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
