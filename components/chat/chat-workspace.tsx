"use client";

import { useRouter } from "next/navigation";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatThread } from "@/components/chat/chat-thread";
import type { Message, Role } from "@/lib/types";

export function ChatWorkspace({
  patientId,
  conversationId,
  role,
  messages,
  placeholder,
  helperText
}: {
  patientId: string;
  conversationId: string;
  role: Role;
  messages: Message[];
  placeholder?: string;
  helperText?: string;
}) {
  const router = useRouter();

  return (
    <>
      <ChatThread messages={messages} />
      <ChatComposer
        patientId={patientId}
        conversationId={conversationId}
        role={role}
        placeholder={placeholder}
        helperText={helperText}
        onCompleted={() => router.refresh()}
      />
    </>
  );
}
