"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { carePlanSchema } from "@/lib/validators/forms";
import type { CarePlan } from "@/lib/types";
import type { z } from "zod";

type CarePlanValues = z.infer<typeof carePlanSchema>;

export function CarePlanForm({ carePlan }: { carePlan: CarePlan }) {
  const router = useRouter();
  const form = useForm<CarePlanValues>({
    resolver: zodResolver(carePlanSchema),
    defaultValues: {
      patientId: carePlan.patientId,
      diagnosisSummary: carePlan.diagnosisSummary,
      treatmentPlan: carePlan.treatmentPlan,
      riskFactors: carePlan.riskFactors,
      personalizedNotes: carePlan.personalizedNotes,
      escalationThresholdsJson: carePlan.escalationThresholdsJson
    }
  });

  async function submit(values: CarePlanValues) {
    const response = await fetch("/api/doctor/care-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      toast.error("Care plan update failed");
      return;
    }

    toast.success("Care plan saved");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="diagnosisSummary">Diagnosis summary</Label>
        <Textarea id="diagnosisSummary" {...form.register("diagnosisSummary")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="treatmentPlan">Treatment plan</Label>
        <Textarea id="treatmentPlan" {...form.register("treatmentPlan")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="riskFactors">Risk factors</Label>
        <Textarea id="riskFactors" {...form.register("riskFactors")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="personalizedNotes">Personalized notes</Label>
        <Textarea id="personalizedNotes" {...form.register("personalizedNotes")} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="redFlags">Red flags</Label>
          <Input
            id="redFlags"
            defaultValue={carePlan.escalationThresholdsJson.redFlags.join(", ")}
            onChange={(event) =>
              form.setValue(
                "escalationThresholdsJson.redFlags",
                event.target.value.split(",").map((value) => value.trim())
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctorReviewTriggers">Doctor review triggers</Label>
          <Input
            id="doctorReviewTriggers"
            defaultValue={carePlan.escalationThresholdsJson.doctorReviewTriggers.join(", ")}
            onChange={(event) =>
              form.setValue(
                "escalationThresholdsJson.doctorReviewTriggers",
                event.target.value.split(",").map((value) => value.trim())
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adminTasks">Admin tasks</Label>
          <Input
            id="adminTasks"
            defaultValue={carePlan.escalationThresholdsJson.adminTasks.join(", ")}
            onChange={(event) =>
              form.setValue(
                "escalationThresholdsJson.adminTasks",
                event.target.value.split(",").map((value) => value.trim())
              )
            }
          />
        </div>
      </div>
      <Button type="submit" className="justify-self-start">
        Save care plan
      </Button>
    </form>
  );
}
