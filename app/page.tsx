import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BrainCircuit, CalendarCheck2, ShieldPlus, Stethoscope } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/rbac";

export default async function MarketingPage() {
  const session = await getSession();

  if (session) {
    redirect(getDashboardPath(session.role));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),transparent_22%),linear-gradient(160deg,#f8fcff_0%,#edf5f8_48%,#f8fbff_100%)] px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-[30px] border border-white/70 bg-white/80 px-6 py-5 backdrop-blur">
          <Brand />
          <Button asChild variant="outline">
            <Link href="/login">Launch demo</Link>
          </Button>
        </header>
        <section className="grid gap-8 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
              Guardrailed AI for modern clinics
            </div>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
                Clinic support,
                <span className="block text-sky-700">not a replacement for care.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                ClinAI Bridge connects patients, doctors, and clinic staff in one secure workflow. The embedded assistant
                stays inside doctor-authored care plans, clinic policy, and escalation guardrails.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white/85">
                <CardContent className="pt-6">
                  <ShieldPlus className="h-6 w-6 text-sky-600" />
                  <p className="mt-4 text-base font-semibold">Strict policy engine</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Medical boundaries enforced after every model draft.</p>
                </CardContent>
              </Card>
              <Card className="bg-white/85">
                <CardContent className="pt-6">
                  <Stethoscope className="h-6 w-6 text-emerald-600" />
                  <p className="mt-4 text-base font-semibold">Doctor-seeded context</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Care plans, thresholds, and phrasing stay patient-specific.</p>
                </CardContent>
              </Card>
              <Card className="bg-white/85">
                <CardContent className="pt-6">
                  <CalendarCheck2 className="h-6 w-6 text-cyan-600" />
                  <p className="mt-4 text-base font-semibold">Admin workflow support</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Scheduling, callbacks, and intake tasks stay organized.</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/login">
                  Open demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <BrainCircuit className="h-4 w-4 text-emerald-500" />
                Gemini adapter with local mock fallback
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-sky-300/20 via-transparent to-emerald-300/20 blur-3xl" />
            <div className="relative rounded-[36px] border border-white/80 bg-white/72 p-5 backdrop-blur">
              <LoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
