"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { BrainCircuit, CalendarDays, MessageSquareText, Settings, ShieldCheck, Stethoscope, UserRoundCog } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const navigationByRole: Record<Role, Array<{ href: string; label: string; icon: typeof Stethoscope }>> = {
  DOCTOR: [
    { href: "/doctor", label: "Doctor workspace", icon: Stethoscope },
    { href: "/schedule", label: "Calendar", icon: CalendarDays },
    { href: "/assistant", label: "Assistant log", icon: BrainCircuit },
    { href: "/settings", label: "Settings", icon: Settings }
  ],
  ADMIN: [
    { href: "/admin", label: "Admin workspace", icon: UserRoundCog },
    { href: "/schedule", label: "Calendar", icon: CalendarDays },
    { href: "/assistant", label: "Assistant log", icon: BrainCircuit },
    { href: "/settings", label: "Settings", icon: Settings }
  ],
  PATIENT: [
    { href: "/patient", label: "Chat", icon: MessageSquareText },
    { href: "/schedule", label: "Schedule", icon: CalendarDays },
    { href: "/settings", label: "Settings", icon: Settings }
  ]
};

export function SideRail({ role }: { role: Role }) {
  const pathname = usePathname();
  const navigation = navigationByRole[role];

  return (
    <aside className="sticky top-0 hidden h-screen w-24 shrink-0 flex-col items-center justify-between border-r border-white/60 bg-white/70 px-4 py-6 backdrop-blur xl:flex">
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-slate-950 text-white shadow-lg shadow-slate-950/15">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <nav className="flex flex-col gap-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const href = (item.href === "/" ? `/${role.toLowerCase()}` : item.href) as Route;
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-sky-50 hover:text-sky-700",
                  active && "bg-sky-600 text-white hover:bg-sky-600 hover:text-white"
                )}
                aria-label={item.label}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center text-[11px] font-medium text-emerald-700">
        Guardrails active
      </div>
    </aside>
  );
}
