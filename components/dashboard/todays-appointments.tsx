"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Clock, ChevronRight, Plus } from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  BOOKED:          { label: "Booked",      cls: "bg-blue-100 text-blue-700" },
  CONFIRMED:       { label: "Confirmed",   cls: "bg-primary/10 text-primary" },
  ARRIVED:         { label: "Arrived",     cls: "bg-green-100 text-green-700" },
  IN_CONSULTATION: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700" },
  COMPLETED:       { label: "Completed",   cls: "bg-muted text-muted-foreground" },
  CANCELLED:       { label: "Cancelled",   cls: "bg-red-100 text-red-600" },
  NO_SHOW:         { label: "No Show",     cls: "bg-red-100 text-red-600" },
}

const appointments = [
  { id: "1", time: "08:00", patient: "Thembi Nkosi", type: "Consultation (New)", scheme: "Discovery Health", status: "COMPLETED" },
  { id: "2", time: "08:30", patient: "James van der Merwe", type: "Follow-up", scheme: "Bonitas", status: "COMPLETED" },
  { id: "3", time: "09:00", patient: "Fatima Patel", type: "Consultation (Repeat)", scheme: "GEMS", status: "IN_CONSULTATION" },
  { id: "4", time: "09:30", patient: "Lungelo Dube", type: "Procedure", scheme: "Cash Patient", status: "ARRIVED" },
  { id: "5", time: "10:00", patient: "Maria Santos", type: "Consultation (New)", scheme: "Momentum Health", status: "CONFIRMED" },
  { id: "6", time: "10:30", patient: "Robert Khumalo", type: "Follow-up", scheme: "Medihelp", status: "BOOKED" },
  { id: "7", time: "11:00", patient: "Ayanda Zulu", type: "Video Consult", scheme: "Discovery Health", status: "BOOKED" },
  { id: "8", time: "11:30", patient: "Priya Naicker", type: "Consultation (Repeat)", scheme: "Fedhealth", status: "BOOKED" },
]

export function TodaysAppointments() {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-primary" />
          <h2 className="font-semibold text-foreground">{"Today's Appointments"}</h2>
          <Badge variant="secondary" className="text-xs">{appointments.length}</Badge>
        </div>
        <Link href="/appointments">
          <Button variant="outline" size="sm" className="gap-1 text-xs">
            <Plus size={13} />
            New
          </Button>
        </Link>
      </div>
      <div className="divide-y divide-border overflow-y-auto max-h-80">
        {appointments.map((appt) => {
          const status = STATUS_STYLES[appt.status] ?? STATUS_STYLES.BOOKED
          return (
            <div key={appt.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 transition-colors">
              {/* Time */}
              <div className="w-12 shrink-0">
                <span className="text-sm font-semibold text-foreground">{appt.time}</span>
              </div>
              {/* Status dot */}
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  appt.status === "IN_CONSULTATION" ? "bg-yellow-500 animate-pulse" :
                  appt.status === "ARRIVED" ? "bg-green-500" :
                  appt.status === "COMPLETED" ? "bg-muted-foreground" :
                  appt.status === "CANCELLED" || appt.status === "NO_SHOW" ? "bg-destructive" :
                  "bg-primary"
                )}
              />
              {/* Patient info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{appt.patient}</p>
                <p className="text-xs text-muted-foreground truncate">{appt.type} · {appt.scheme}</p>
              </div>
              {/* Status badge */}
              <Badge className={cn("text-xs shrink-0 font-medium", status.cls)} variant="outline">
                {status.label}
              </Badge>
              {/* Action */}
              {(appt.status === "ARRIVED" || appt.status === "IN_CONSULTATION") && (
                <Link href={`/invoices/new?appt=${appt.id}`}>
                  <Button size="sm" variant="default" className="text-xs h-7 shrink-0">
                    Bill
                  </Button>
                </Link>
              )}
              {appt.status === "BOOKED" || appt.status === "CONFIRMED" ? (
                <Link href={`/appointments/${appt.id}`}>
                  <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                    <ChevronRight size={14} />
                  </Button>
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="p-3 border-t border-border">
        <Link href="/appointments">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
            View all appointments <ChevronRight size={13} className="ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
