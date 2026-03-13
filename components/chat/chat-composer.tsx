"use client";

import { useRef, useState } from "react";
import { Camera, Mic, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "@/lib/types";

interface ChatComposerProps {
  patientId: string;
  conversationId: string;
  role: Role;
  onCompleted: () => void;
}

export function ChatComposer({ patientId, conversationId, role, onCompleted }: ChatComposerProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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
      toast.error("Message failed");
      return;
    }

    setMessage("");
    toast.success("Assistant updated");
    onCompleted();
  }

  async function uploadFile(file: File, type: "IMAGE" | "AUDIO") {
    const reader = new FileReader();
    reader.onload = async () => {
      const payload = String(reader.result).split(",")[1] ?? "";
      setSubmitting(true);
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          conversationId,
          type,
          mimeType: file.type,
          fileName: file.name,
          payload
        })
      });
      setSubmitting(false);

      if (!response.ok) {
        toast.error("Upload failed");
        return;
      }

      toast.success(type === "IMAGE" ? "Photo uploaded for review" : "Voice note uploaded");
      onCompleted();
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about your clinic plan, follow-up, or approved admin help"
          className="h-14 flex-1 rounded-[22px] border-transparent bg-slate-50 text-base"
        />
        <div className="flex items-center gap-2">
          <input
            ref={audioInputRef}
            className="hidden"
            type="file"
            accept="audio/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file, "AUDIO");
              }
            }}
          />
          <input
            ref={imageInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadFile(file, "IMAGE");
              }
            }}
          />
          <Button type="button" variant="secondary" size="icon" disabled={submitting} onClick={() => audioInputRef.current?.click()}>
            <Mic className="h-4 w-4" />
          </Button>
          <Button type="button" variant="secondary" size="icon" disabled={submitting} onClick={() => imageInputRef.current?.click()}>
            <Camera className="h-4 w-4" />
          </Button>
          <Button type="button" size="icon" disabled={submitting} onClick={() => void sendText()}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
