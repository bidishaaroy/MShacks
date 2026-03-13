import type { Metadata } from "next";
import { AppToaster } from "@/components/ui/toaster";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "ClinAI Bridge",
  description: "Secure digital-health workflow MVP with patient and staff portals."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
