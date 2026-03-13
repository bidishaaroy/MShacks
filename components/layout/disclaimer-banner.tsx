import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">ClinAI Bridge is a clinic support assistant and does not replace emergency or medical care.</p>
        <p className="text-amber-800/90">For emergencies call local emergency services immediately.</p>
      </div>
    </div>
  );
}
