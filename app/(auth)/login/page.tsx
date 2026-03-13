import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Brand } from "@/components/layout/brand";
import { getSession } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/rbac";

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(getDashboardPath(session.role));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_25%),linear-gradient(180deg,#f7fbff_0%,#eef5f9_100%)] px-6 py-10">
      <div className="grid w-full max-w-5xl gap-8 rounded-[40px] border border-white/80 bg-white/60 p-6 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur lg:grid-cols-[1fr_420px] lg:p-8">
        <section className="flex flex-col justify-between rounded-[34px] bg-slate-950 px-8 py-10 text-white">
          <div>
            <Brand />
            <div className="mt-12 max-w-xl">
              <p className="text-sm uppercase tracking-[0.32em] text-sky-300">MVP workspace</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight">A secure clinic communication layer for patients, doctors, and staff.</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Demo roles share one seeded patient record so you can move between care-plan authoring, AI-assisted patient support,
                media uploads, escalation review, and admin follow-up.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-300">
            <p>Doctor: seed patient instructions and thresholds</p>
            <p>Admin: review callback tasks and intake clarifications</p>
            <p>Patient: chat, upload photos, and send voice notes with guardrails active</p>
          </div>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
