"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function EscalateButton({
  patientId,
  conversationId
}: {
  patientId: string;
  conversationId: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleEscalate() {
    setSubmitting(true);
    const response = await fetch("/api/escalations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        conversationId,
        reason: "Patient requested manual clinic follow-up from the portal."
      })
    });
    setSubmitting(false);

    const payload = (await response.json()) as { ok?: boolean; duplicate?: boolean; message?: string };

    if (payload.duplicate) {
      toast.message("This request has already been escalated recently.");
      return;
    }

    if (!response.ok || !payload.ok) {
      toast.error("Unable to escalate to clinic");
      return;
    }

    toast.success("Your request has been escalated to the clinic.");
    router.refresh();
  }

  return (
    <Button variant="destructive" className="w-full" disabled={submitting} onClick={() => void handleEscalate()}>
      {submitting ? "Escalating..." : "Escalate to clinic"}
    </Button>
  );
}
