"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ChecklistItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChecklistManager({ items }: { items: ChecklistItem[] }) {
  const router = useRouter();

  async function updateItem(itemId: string, done: boolean) {
    const response = await fetch("/api/admin/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, done })
    });

    if (!response.ok) {
      toast.error("Checklist update failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-[24px] bg-slate-50 p-4">
          <p className={cn("text-sm text-slate-700", item.done && "line-through opacity-60")}>{item.label}</p>
          <Button size="sm" variant={item.done ? "secondary" : "outline"} onClick={() => void updateItem(item.id, !item.done)}>
            <Check className="h-4 w-4" />
            {item.done ? "Checked" : "Check off"}
          </Button>
        </div>
      ))}
    </div>
  );
}
