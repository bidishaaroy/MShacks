import { MessageBubble } from "@/components/chat/message-bubble";
import type { Message } from "@/lib/types";

export function ChatThread({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto rounded-[28px] bg-slate-50/80 p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
