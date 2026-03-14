import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function AppointmentCalendar({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{appointment.reason}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatDateTime(appointment.scheduledFor)} with {appointment.assignedTo}
              </p>
            </div>
            <Badge variant={appointment.status === "URGENT" ? "danger" : appointment.status === "COMPLETED" ? "success" : "default"}>
              {appointment.status}
            </Badge>
          </div>
          <p className="mt-3 text-xs text-slate-500">Scheduled by {appointment.scheduledByName}</p>
          {appointment.notes ? <p className="mt-2 text-sm text-slate-700">{appointment.notes}</p> : null}
        </div>
      ))}
    </div>
  );
}
