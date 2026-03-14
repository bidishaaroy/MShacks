import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/forms/logout-button";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";
import { featureFlags } from "@/lib/env";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await getRepository().getDashboardData();
  const currentUser = await getRepository().getCurrentUser(session.userId);

  return (
    <AppShell role={session.role} data={data}>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Current signed-in workspace and session actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Name</p>
              <p className="mt-2 text-base font-medium text-slate-900">{currentUser?.name}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Email</p>
              <p className="mt-2 text-base text-slate-900">{currentUser?.email}</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Role</p>
              <div className="mt-3">
                <Badge variant="default">{session.role}</Badge>
              </div>
            </div>
            <LogoutButton fullWidth />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Environment and adapter status</CardTitle>
            <CardDescription>Local-first adapters keep the MVP safe and demo-ready when cloud services are unavailable.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Gemini</p>
                <Badge variant={featureFlags.gemini ? "success" : "warning"}>{featureFlags.gemini ? "Live" : "Mock"}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700">Dynamic structured responses with graceful fallback if the API is unavailable.</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Database</p>
                <Badge variant={featureFlags.database ? "success" : "warning"}>{featureFlags.database ? "Postgres" : "Demo store"}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700">Care plans, messages, and escalations persist in the configured backend.</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Blob storage</p>
                <Badge variant={featureFlags.blob ? "success" : "warning"}>{featureFlags.blob ? "Azure" : "Mock"}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700">Media and sanitized exports use Azure Blob when configured.</p>
            </div>
            <div className="rounded-[24px] bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">De-identification</p>
                <Badge variant={featureFlags.deid ? "success" : "warning"}>{featureFlags.deid ? "Azure" : "Mock"}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-700">Learning-style artifacts are sanitized before longer-term storage paths are used.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
