"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminSuggestion } from "@/lib/types";

export function AdminSuggestionList({ suggestions }: { suggestions: AdminSuggestion[] }) {
  const router = useRouter();

  async function selectSuggestion(suggestionId: string) {
    const response = await fetch("/api/admin/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestionId })
    });

    if (!response.ok) {
      toast.error("Suggestion action failed");
      return;
    }

    toast.success("Suggestion added to admin workflow");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-900">{suggestion.title}</p>
                {suggestion.selected ? <Badge variant="success">Chosen</Badge> : null}
              </div>
              <p className="mt-2 text-sm text-slate-600">{suggestion.detail}</p>
            </div>
            <Button size="sm" variant="outline" disabled={suggestion.selected} onClick={() => void selectSuggestion(suggestion.id)}>
              {suggestion.selected ? "Added" : "Add"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
