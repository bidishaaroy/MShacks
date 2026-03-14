"use client";

import { useRouter } from "next/navigation";
import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Escalation } from "@/lib/types";

export function IntakeQueueList({ escalations }: { escalations: Escalation[] }) {
  const router = useRouter();

  async function scheduleItem(escalationId: string) {
    const response = await fetch("/api/admin/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escalationId })
    });

    if (!response.ok) {
      toast.error("Unable to schedule intake item");
      return;
    }

    toast.success("Escalation moved into scheduled intake review");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {escalations.map((item) => (
        <div key={item.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant={item.status === "IN_REVIEW" ? "success" : item.riskLevel === "CRITICAL" ? "danger" : "warning"}>
                {item.status}
              </Badge>
              <p className="mt-3 text-sm text-slate-700">{item.reason}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => void scheduleItem(item.id)}>
              {item.status === "IN_REVIEW" ? <CheckCircle2 className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
              {item.status === "IN_REVIEW" ? "Scheduled" : "Schedule"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
