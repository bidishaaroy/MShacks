import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getRepository } from "@/lib/data/repository";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const data = await getRepository().getDashboardData();

  return (
    <AppShell role={session.role} data={data}>
      <Card>
        <CardHeader>
          <CardTitle>Environment modes</CardTitle>
          <CardDescription>Local-first adapters keep the MVP running without cloud credentials.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] bg-slate-50 p-4">
            <Badge>AI provider</Badge>
            <p className="mt-3 text-sm text-slate-700">Gemini with deterministic mock fallback</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-4">
            <Badge>Blob storage</Badge>
            <p className="mt-3 text-sm text-slate-700">Azure Blob with mock local URLs when unset</p>
          </div>
          <div className="rounded-[24px] bg-slate-50 p-4">
            <Badge>De-identification</Badge>
            <p className="mt-3 text-sm text-slate-700">Azure Health Data Services abstraction with mock redaction</p>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
