import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-offset-white transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
