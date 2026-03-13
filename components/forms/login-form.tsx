"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/lib/validators/forms";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

const demoAccounts: LoginValues[] = [
  { email: "doctor@demo.com", password: "password123" },
  { email: "admin@demo.com", password: "password123" },
  { email: "patient@demo.com", password: "password123" }
];

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: demoAccounts[0]
  });

  async function submit(values: LoginValues) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      toast.error("Invalid credentials");
      return;
    }

    const payload = (await response.json()) as { redirectTo: string };
    router.push(payload.redirectTo as Route);
    router.refresh();
  }

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader>
        <CardTitle>Demo access</CardTitle>
        <CardDescription>Use seeded clinic roles to explore patient, doctor, and admin workflows.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2 md:grid-cols-3">
          {demoAccounts.map((account) => (
            <Button
              key={account.email}
              type="button"
              variant="outline"
              className="justify-start rounded-2xl"
              onClick={() => form.reset(account)}
            >
              {account.email.split("@")[0]}
            </Button>
          ))}
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...form.register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
          </div>
          <Button type="submit" className="w-full">
            Continue to workspace
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
import type { Route } from "next";
