"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "@/lib/types";

interface ChatComposerProps {
  patientId: string;
  conversationId: string;
  role: Role;
  onCompleted: () => void;
  placeholder?: string;
  helperText?: string;
}

export function ChatComposer({
  patientId,
  conversationId,
  role,
  onCompleted,
  placeholder,
  helperText
}: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function sendText() {
    if (!message.trim()) {
      return;
    }

    setSubmitting(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversationId,
        patientId,
        role,
        attachmentType: "TEXT"
      })
    });
    setSubmitting(false);

    if (!response.ok) {
      toast.error(role === "PATIENT" ? "Message failed" : "Update failed");
      return;
    }

    setMessage("");
    toast.success(role === "PATIENT" ? "Clin AI Bot updated" : "Conversation updated");
    onCompleted();
  }

  return (
    <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
      <p className="px-2 pb-2 text-sm text-slate-500">
        {helperText ?? "Ask about your care plan, follow-up, or approved clinic support."}
      </p>
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void sendText();
            }
          }}
          placeholder={placeholder ?? "Type your question for Clin AI Bot"}
          className="h-14 flex-1 rounded-[22px] border-transparent bg-slate-50 text-base"
        />
        <div className="flex items-center gap-2">
          <Button type="button" size="icon" disabled={submitting} onClick={() => void sendText()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
