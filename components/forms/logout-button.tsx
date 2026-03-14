"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      toast.error("Logout failed");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" className={fullWidth ? "w-full" : ""} onClick={() => void handleLogout()}>
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
