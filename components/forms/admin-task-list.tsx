"use client";

import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminTask } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function AdminTaskList({ tasks }: { tasks: AdminTask[] }) {
  const router = useRouter();

  async function markDone(taskId: string) {
    const response = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: "DONE" })
    });

    if (!response.ok) {
      toast.error("Task update failed");
      return;
    }

    toast.success("Task completed");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={task.status === "DONE" ? "success" : "warning"}>{task.status}</Badge>
                <span className="text-xs text-slate-500">{formatDateTime(task.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{task.title}</p>
            </div>
            {task.status === "OPEN" ? (
              <Button size="sm" variant="outline" onClick={() => void markDone(task.id)}>
                <CheckCheck className="h-4 w-4" />
                Complete
              </Button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
