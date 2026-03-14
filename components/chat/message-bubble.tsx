import { Bot, Stethoscope, UserRound, UserRoundCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import type { Message } from "@/lib/types";

const senderConfig = {
  AI: {
    icon: Bot,
    bubble: "bg-sky-50 text-slate-900 border border-sky-100",
    label: "Clin AI Bot",
    badge: "default" as const
  },
  PATIENT: {
    icon: UserRound,
    bubble: "bg-slate-950 text-white",
    label: "Patient",
    badge: "muted" as const
  },
  DOCTOR: {
    icon: Stethoscope,
    bubble: "bg-emerald-50 text-slate-900 border border-emerald-100",
    label: "Doctor",
    badge: "success" as const
  },
  ADMIN: {
    icon: UserRoundCog,
    bubble: "bg-amber-50 text-slate-900 border border-amber-100",
    label: "Admin",
    badge: "warning" as const
  }
};

export function MessageBubble({ message }: { message: Message }) {
  const config = senderConfig[message.senderType];
  const Icon = config.icon;

  return (
    <div className={cn("flex gap-3", message.senderType === "PATIENT" ? "justify-end" : "justify-start")}>
      {message.senderType !== "PATIENT" ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      ) : null}
      <div className={cn("max-w-[78%] rounded-[26px] px-4 py-3 shadow-sm", config.bubble)}>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant={config.badge}>{config.label}</Badge>
          <span className="text-xs opacity-70">{formatDateTime(message.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
      </div>
    </div>
  );
}
