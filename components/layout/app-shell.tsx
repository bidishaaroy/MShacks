import { Sparkles } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { SideRail } from "@/components/layout/side-rail";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { DashboardData } from "@/lib/data/repository";
import type { Role } from "@/lib/types";

export function AppShell({
  role,
  data,
  children,
  rightPanel
}: {
  role: Role;
  data: DashboardData;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
}) {
  const activeUser = data.users.find((user) => user.role === role);

  return (
    <div className="app-shell-bg min-h-screen text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1640px]">
        <SideRail role={role} />
        <div className="flex min-h-screen flex-1 flex-col px-4 py-4 lg:px-6">
          <header className="flex items-center justify-between rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <Brand />
            <div className="flex items-center gap-3">
              <Badge variant="success">Safety policies enforced</Badge>
              <ThemeToggle />
              <div className="flex items-center gap-3 rounded-full bg-slate-50 px-3 py-2">
                <Avatar>
                  <AvatarFallback>{activeUser?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold">{activeUser?.name}</p>
                  <p className="text-xs text-slate-500">{role.toLowerCase()} workspace</p>
                </div>
              </div>
            </div>
          </header>
          <div className="mt-4 flex flex-1 gap-4">
            <main className="flex min-h-[calc(100vh-7rem)] flex-1 flex-col rounded-[32px] border border-white/80 bg-white/70 p-4 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur lg:p-6">
              {children}
            </main>
            {rightPanel ? (
              <aside className="hidden w-[360px] shrink-0 xl:block">
                <div className="sticky top-4 flex max-h-[calc(100vh-2rem)] flex-col gap-4 overflow-auto rounded-[32px] border border-white/80 bg-white/75 p-4 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.35)] backdrop-blur lg:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">Clinical snapshot</p>
                      <p className="text-xs text-slate-500">Patient-aware assistant context</p>
                    </div>
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                  </div>
                  {rightPanel}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
