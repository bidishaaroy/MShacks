import { AppShell } from "@/components/layout/app-shell";
import { AdminTaskList } from "@/components/forms/admin-task-list";
import { AdminSuggestionList } from "@/components/forms/admin-suggestion-list";
import { AppointmentCalendar } from "@/components/forms/appointment-calendar";
import { ChecklistManager } from "@/components/forms/checklist-manager";
import { IntakeQueueList } from "@/components/forms/intake-queue-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          <Card>
            <CardHeader>
              <CardTitle>Onboarding checklist</CardTitle>
              <CardDescription>Clickable intake and onboarding actions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChecklistManager items={data.onboardingChecklist} />
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Intake queue</CardTitle>
            <CardDescription>Tick an item to move it into scheduled intake review.</CardDescription>
          </CardHeader>
          <CardContent>
            <IntakeQueueList escalations={data.escalations} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scheduling calendar</CardTitle>
            <CardDescription>See who scheduled each appointment and which cases are urgent.</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentCalendar appointments={data.appointments} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI admin suggestions</CardTitle>
            <CardDescription>Choose a suggestion to add it into the working queue.</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminSuggestionList suggestions={data.adminSuggestions} />
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
