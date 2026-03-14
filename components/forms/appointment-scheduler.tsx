"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Role } from "@/lib/types";

export function AppointmentScheduler({
  patientId,
  role,
  assignedTo,
  defaultReason = "Follow-up appointment"
}: {
  patientId: string;
  role: Role;
  assignedTo: string;
  defaultReason?: string;
}) {
  const router = useRouter();
  const [scheduledFor, setScheduledFor] = useState("");
  const [reason, setReason] = useState(defaultReason);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!scheduledFor) {
      toast.error("Choose a date and time");
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        scheduledFor: new Date(scheduledFor).toISOString(),
        reason,
        status: role === "ADMIN" && /urgent|escalat/i.test(reason) ? "URGENT" : "SCHEDULED",
        assignedTo,
        notes
      })
    });
    setSubmitting(false);

    if (!response.ok) {
      toast.error("Appointment could not be scheduled");
      return;
    }

    toast.success("Appointment scheduled");
    setScheduledFor("");
    setNotes("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scheduledFor">Date and time</Label>
        <Input id="scheduledFor" type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-[96px]" />
      </div>
      <Button className="w-full" onClick={() => void submit()} disabled={submitting}>
        {submitting ? "Scheduling..." : "Schedule appointment"}
      </Button>
    </div>
  );
}
