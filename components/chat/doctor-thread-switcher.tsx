"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatThread } from "@/components/chat/chat-thread";
import type { DoctorThread } from "@/lib/types";

export function DoctorThreadSwitcher({ threads }: { threads: DoctorThread[] }) {
  const [active, setActive] = useState(threads[0]?.id ?? "");

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-2 rounded-[24px] bg-slate-100 p-2">
        {threads.map((thread) => (
          <TabsTrigger key={thread.id} value={thread.id} className="rounded-2xl">
            {thread.patientName}
          </TabsTrigger>
        ))}
      </TabsList>
      {threads.map((thread) => (
        <TabsContent key={thread.id} value={thread.id} className="mt-0">
          <div className="mb-3 rounded-[24px] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{thread.patientName}</p>
            <p className="mt-1 text-sm text-slate-600">{thread.summary}</p>
          </div>
          <ChatThread messages={thread.messages} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
