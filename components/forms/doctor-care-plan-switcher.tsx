"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarePlanForm } from "@/components/forms/care-plan-form";
import type { CarePlanOption } from "@/lib/types";

export function DoctorCarePlanSwitcher({ carePlans }: { carePlans: CarePlanOption[] }) {
  const [active, setActive] = useState(carePlans[0]?.patientId ?? "");

  return (
    <Tabs value={active} onValueChange={setActive} className="w-full">
      <TabsList className="mb-5 flex h-auto w-full flex-wrap justify-start gap-2 rounded-[24px] bg-slate-100 p-2">
        {carePlans.map((plan) => (
          <TabsTrigger key={plan.patientId} value={plan.patientId} className="rounded-2xl">
            {plan.patientName}
          </TabsTrigger>
        ))}
      </TabsList>
      {carePlans.map((plan) => (
        <TabsContent key={plan.patientId} value={plan.patientId} className="mt-0">
          <div className="mb-4 rounded-[24px] bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{plan.patientName}</p>
            <p className="mt-1 text-sm text-slate-600">{plan.diagnosisSummary}</p>
          </div>
          <CarePlanForm carePlan={plan} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
