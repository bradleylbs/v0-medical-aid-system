"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"

const STATUS_STYLES: Record<string, { label: string; cls: string; dot: string }> = {
  BOOKED:          { label: "Booked",      cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  CONFIRMED:       { label: "Confirmed",   cls: "bg-primary/10 text-primary",   dot: "bg-primary" },
  ARRIVED:         { label: "Arrived",     cls: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  IN_CONSULTATION: { label: "In Progress", cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  COMPLETED:       { label: "Completed",   cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  CANCELLED:       { label: "Cancelled",   cls: "bg-red-100 text-red-600",      dot: "bg-destructive" },
  NO_SHOW:         { label: "No Show",     cls: "bg-red-100 text-red-600",      dot: "bg-destructive" },
}

const WEEK_APPOINTMENTS = [
  // Monday
  { id: "a1", day: 0, time: "08:00", patient: "Thembi Nkosi", type: "Consultation", status: "COMPLETED", duration: 30 },
  { id: "a2", day: 0, time: "09:00", patient: "James van der Merwe", type: "Follow-up", status: "COMPLETED", duration: 20 },
  { id: "a3", day: 0, time: "10:30", patient: "Fatima Patel", type: "Consultation", status: "COMPLETED", duration: 30 },
  // Tuesday
  { id: "a4", day: 1, time: "08:30", patient: "Lungelo Dube", type: "Procedure", status: "COMPLETED", duration: 45 },
  { id: "a5", day: 1, time: "11:00", patient: "Maria Santos", type: "Consultation (New)", status: "COMPLETED", duration: 30 },
  // Wednesday
  { id: "a6", day: 2, time: "09:00", patient: "Robert Khumalo", type: "Follow-up", status: "COMPLETED", duration: 20 },
  { id: "a7", day: 2, time: "14:00", patient: "Ayanda Zulu", type: "Video Consult", status: "COMPLETED", duration: 20 },
  // Thursday
  { id: "a8", day: 3, time: "08:00", patient: "Priya Naicker", type: "Consultation", status: "COMPLETED", duration: 30 },
  { id: "a9", day: 3, time: "10:00", patient: "Thembi Nkosi", type: "Follow-up", status: "COMPLETED", duration: 20 },
  // Friday (today)
  { id: "a10", day: 4, time: "08:00", patient: "Thembi Nkosi", type: "Consultation", status: "COMPLETED", duration: 30 },
  { id: "a11", day: 4, time: "08:30", patient: "James van der Merwe", type: "Follow-up", status: "COMPLETED", duration: 20 },
  { id: "a12", day: 4, time: "09:00", patient: "Fatima Patel", type: "Consultation", status: "IN_CONSULTATION", duration: 30 },
  { id: "a13", day: 4, time: "09:30", patient: "Lungelo Dube", type: "Procedure", status: "ARRIVED", duration: 45 },
  { id: "a14", day: 4, time: "10:00", patient: "Maria Santos", type: "Consultation (New)", status: "CONFIRMED", duration: 30 },
  { id: "a15", day: 4, time: "10:30", patient: "Robert Khumalo", type: "Follow-up", status: "BOOKED", duration: 20 },
  { id: "a16", day: 4, time: "11:00", patient: "Ayanda Zulu", type: "Video Consult", status: "BOOKED", duration: 20 },
  { id: "a17", day: 4, time: "11:30", patient: "Priya Naicker", type: "Consultation", status: "BOOKED", duration: 30 },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const DATES = ["21 Apr", "22 Apr", "23 Apr", "24 Apr", "25 Apr"]
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]

export default function AppointmentsPage() {
  const [selectedAppt, setSelectedAppt] = useState<typeof WEEK_APPOINTMENTS[0] | null>(null)

  return (
    <AppShell title="Appointments" subtitle="Weekly calendar — Dr. Sipho Dlamini">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronLeft size={16} />
          </Button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">21 – 25 April 2026</p>
            <p className="text-xs text-muted-foreground">Week 17</p>
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronRight size={16} />
          </Button>
          <Button variant="outline" size="sm" className="text-xs">Today</Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 mr-2 text-xs text-muted-foreground">
            {["BOOKED", "ARRIVED", "IN_CONSULTATION", "COMPLETED"].map(s => (
              <span key={s} className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full", STATUS_STYLES[s].dot)} />
                {STATUS_STYLES[s].label}
              </span>
            ))}
          </div>
          <Link href="/appointments/new">
            <Button className="gap-2">
              <Plus size={16} />
              New Appointment
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar grid */}
        <Card className="flex-1 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-border">
              <div className="p-3 border-r border-border" />
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className={cn(
                    "p-3 text-center border-r border-border last:border-r-0",
                    i === 4 ? "bg-primary/5" : ""
                  )}
                >
                  <p className={cn("text-xs font-semibold uppercase tracking-wide", i === 4 ? "text-primary" : "text-muted-foreground")}>{day}</p>
                  <p className={cn("text-sm font-bold mt-0.5", i === 4 ? "text-primary" : "text-foreground")}>{DATES[i]}</p>
                  {i === 4 && <Badge className="text-[10px] mt-1 bg-primary text-white">Today</Badge>}
                </div>
              ))}
            </div>

            {/* Time rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-6 border-b border-border hover:bg-muted/10 transition-colors">
                <div className="p-3 border-r border-border">
                  <span className="text-xs text-muted-foreground font-medium">{hour}</span>
                </div>
                {DAYS.map((_, dayIdx) => {
                  const appts = WEEK_APPOINTMENTS.filter(
                    a => a.day === dayIdx && a.time === hour
                  )
                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        "p-1.5 border-r border-border last:border-r-0 min-h-[56px]",
                        dayIdx === 4 ? "bg-primary/5" : ""
                      )}
                    >
                      {appts.map(appt => {
                        const s = STATUS_STYLES[appt.status]
                        return (
                          <button
                            key={appt.id}
                            onClick={() => setSelectedAppt(appt)}
                            className={cn(
                              "w-full text-left rounded-md px-2 py-1 text-xs font-medium border transition-all hover:shadow-sm",
                              appt.status === "COMPLETED" ? "bg-muted/60 text-muted-foreground border-border" :
                              appt.status === "IN_CONSULTATION" ? "bg-yellow-50 text-yellow-800 border-yellow-200 animate-pulse" :
                              appt.status === "ARRIVED" ? "bg-green-50 text-green-800 border-green-200" :
                              "bg-primary/10 text-primary border-primary/20"
                            )}
                          >
                            <p className="truncate font-semibold">{appt.patient}</p>
                            <p className="truncate opacity-75">{appt.type}</p>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Appointment detail panel */}
        {selectedAppt ? (
          <Card className="w-72 shrink-0 p-5 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Appointment Detail</h3>
              <button onClick={() => setSelectedAppt(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                  {selectedAppt.patient.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedAppt.patient}</p>
                  <Badge className={cn("text-xs", STATUS_STYLES[selectedAppt.status].cls)} variant="outline">
                    {STATUS_STYLES[selectedAppt.status].label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={13} />
                  <span>{selectedAppt.time} · {selectedAppt.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={13} />
                  <span>{DATES[selectedAppt.day]} · {selectedAppt.type}</span>
                </div>
              </div>
              {(selectedAppt.status === "ARRIVED" || selectedAppt.status === "IN_CONSULTATION") && (
                <Link href={`/invoices/new?appt=${selectedAppt.id}`}>
                  <Button size="sm" className="w-full gap-2 mt-3">
                    <Clock size={13} />
                    Start Billing
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <Card className="w-72 shrink-0 p-5 h-fit flex flex-col items-center justify-center text-center gap-3 min-h-32">
            <Calendar size={24} className="text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Click an appointment to view details</p>
          </Card>
        )}
      </div>
    </AppShell>
  )
}
