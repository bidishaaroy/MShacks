"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function QuickConditionPrompts({
  patientId,
  conversationId
}: {
  patientId: string;
  conversationId: string;
}) {
  const router = useRouter();
  const [loadingPrompt, setLoadingPrompt] = useState<string | null>(null);

  const prompts = [
    "Cough flare tonight: what part of my care plan should I focus on first?",
    "Fever came back: when should I contact the clinic based on my notes?",
    "Chest tightness with walking: what warning signs should I monitor now?"
  ];

  async function sendPrompt(message: string) {
    setLoadingPrompt(message);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversationId,
        patientId,
        role: "PATIENT",
        attachmentType: "TEXT"
      })
    });
    setLoadingPrompt(null);

    if (!response.ok) {
      toast.error("Clin AI Bot could not answer right now");
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-950">Clin AI Bot</p>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back. I can help explain your doctor&apos;s notes, clinic follow-up steps, and safe symptom monitoring.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            className="h-auto rounded-2xl px-4 py-3 text-left"
            disabled={loadingPrompt === prompt}
            onClick={() => void sendPrompt(prompt)}
          >
            {loadingPrompt === prompt ? "Checking..." : prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}
