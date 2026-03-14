import type { Metadata } from "next";
import { ThemeScript } from "@/components/layout/theme-script";
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
        <ThemeScript />
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
