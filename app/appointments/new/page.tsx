"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_PATIENTS } from "@/lib/mock-data"
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Search,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const APPOINTMENT_TYPES = [
  "Consultation (New Patient)",
  "Consultation (Follow-up)",
  "Procedure",
  "Chronic Review",
  "Video Consultation",
  "Telephonic Consultation",
  "Home Visit",
  "Pre-Operative Assessment",
  "Post-Operative Review",
]

const TIME_SLOTS = [
  "07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00",
  "16:30","17:00",
]

const DURATION_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
]

// Simulated existing appointments for conflict detection
const EXISTING_SLOTS: Record<string, string[]> = {
  "2026-04-28": ["08:00", "08:30", "09:00", "10:00"],
  "2026-04-29": ["09:00", "09:30", "14:00"],
}

interface FormErrors {
  patient?: string
  date?: string
  time?: string
  type?: string
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preloadedPatientId = searchParams.get("patient")

  const preloadedPatient = preloadedPatientId
    ? MOCK_PATIENTS.find(p => p.id === preloadedPatientId) ?? null
    : null

  // Form state
  const [selectedPatient, setSelectedPatient] = useState<typeof MOCK_PATIENTS[0] | null>(preloadedPatient)
  const [patientSearch, setPatientSearch] = useState("")
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [date, setDate] = useState("2026-04-28")
  const [selectedTime, setSelectedTime] = useState("")
  const [duration, setDuration] = useState(20)
  const [appointmentType, setAppointmentType] = useState("")
  const [notes, setNotes] = useState("")
  const [sendReminder, setSendReminder] = useState(true)

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const filteredPatients = MOCK_PATIENTS.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    (p.membershipNumber ?? "").toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.idNumber.includes(patientSearch)
  ).slice(0, 6)

  const bookedSlots = EXISTING_SLOTS[date] ?? []

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!selectedPatient) errs.patient = "Please select a patient"
    if (!date) errs.date = "Please select a date"
    if (!selectedTime) errs.time = "Please select a time slot"
    if (!appointmentType) errs.type = "Please select an appointment type"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSubmitted(true)
    // Simulate save
    setTimeout(() => {
      router.push("/appointments")
    }, 1200)
  }

  // End time calculation
  const endTime = (() => {
    if (!selectedTime) return ""
    const [h, m] = selectedTime.split(":").map(Number)
    const total = h * 60 + m + duration
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
  })()

  return (
    <AppShell title="New Appointment" subtitle="Book a patient appointment">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={15} /> Back to Appointments
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="xl:col-span-2 space-y-5">

          {/* Patient selection */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Patient</h3>
              <span className="text-destructive text-sm">*</span>
            </div>

            {!selectedPatient ? (
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, membership number or ID..."
                  className={cn("pl-9", errors.patient && "border-destructive")}
                  value={patientSearch}
                  onFocus={() => setShowPatientDropdown(true)}
                  onBlur={() => setTimeout(() => setShowPatientDropdown(false), 150)}
                  onChange={e => { setPatientSearch(e.target.value); setShowPatientDropdown(true) }}
                />
                {showPatientDropdown && filteredPatients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {filteredPatients.map(p => (
                      <button
                        key={p.id}
                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 text-left"
                        onMouseDown={() => { setSelectedPatient(p); setPatientSearch("") }}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.scheme} {p.membershipNumber ? `· ${p.membershipNumber}` : "· Cash"} · DOB: {p.dateOfBirth}
                          </p>
                        </div>
                        {p.outstandingBalance > 0 && (
                          <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200 text-xs shrink-0">
                            R {p.outstandingBalance.toFixed(0)} outstanding
                          </Badge>
                        )}
                      </button>
                    ))}
                    <Link
                      href="/patients/new"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-muted/50 border-t border-border"
                    >
                      <Plus size={14} />
                      Register new patient
                    </Link>
                  </div>
                )}
                {errors.patient && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.patient}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center shrink-0">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.scheme} · {selectedPatient.membershipNumber ?? "Cash"} · {selectedPatient.planOption ?? "—"}
                  </p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">
                  ✕
                </button>
              </div>
            )}
          </Card>

          {/* Date, time, duration */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Date & Time</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => { setDate(e.target.value); setSelectedTime("") }}
                  className={cn("mt-1", errors.date && "border-destructive")}
                />
                {errors.date && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.date}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Duration</label>
                <div className="flex gap-1.5 mt-1">
                  {DURATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDuration(opt.value)}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors",
                        duration === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Time slot picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Time Slot <span className="text-destructive">*</span>
                </label>
                {bookedSlots.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {bookedSlots.length} slots booked on this day
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {TIME_SLOTS.map(slot => {
                  const isBooked = bookedSlots.includes(slot)
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      onClick={() => !isBooked && setSelectedTime(slot)}
                      disabled={isBooked}
                      className={cn(
                        "py-2 text-xs font-medium rounded-lg border transition-colors",
                        isBooked
                          ? "bg-muted/50 text-muted-foreground/50 border-border cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
              {errors.time && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle size={11} />{errors.time}
                </p>
              )}
              {selectedTime && (
                <p className="text-xs text-primary mt-2 flex items-center gap-1.5">
                  <Clock size={11} />
                  {selectedTime} – {endTime} ({duration} minutes)
                </p>
              )}
            </div>
          </Card>

          {/* Appointment type */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Appointment Type</h3>
              <span className="text-destructive text-sm">*</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {APPOINTMENT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setAppointmentType(type)}
                  className={cn(
                    "px-3 py-2.5 text-xs font-medium rounded-lg border text-left transition-colors",
                    appointmentType === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle size={11} />{errors.type}
              </p>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-5">
            <label className="text-xs font-medium text-muted-foreground">Appointment Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Reason for visit, instructions for patient..."
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Card>
        </div>

        {/* Right column: summary + actions */}
        <div className="space-y-5">
          {/* Booking summary */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4 text-sm">Booking Summary</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedPatient
                      ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                      : <span className="text-muted-foreground italic">Not selected</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground">
                    {date
                      ? new Date(date).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                      : <span className="text-muted-foreground italic">Not selected</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTime
                      ? `${selectedTime} – ${endTime} (${duration} min)`
                      : <span className="text-muted-foreground italic">Not selected</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {appointmentType || <span className="text-muted-foreground italic">Not selected</span>}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Reminders */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-3 text-sm">Reminders</h4>
            <button
              onClick={() => setSendReminder(!sendReminder)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                sendReminder
                  ? "bg-primary/5 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border"
              )}
            >
              <span>Send SMS reminder 24h before</span>
              <div className={cn(
                "w-9 h-5 rounded-full transition-colors relative shrink-0",
                sendReminder ? "bg-primary" : "bg-muted"
              )}>
                <div className={cn(
                  "w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm",
                  sendReminder ? "translate-x-4" : "translate-x-0.5"
                )} />
              </div>
            </button>
            {sendReminder && selectedPatient?.phone && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <CheckCircle size={11} className="text-green-500" />
                Will be sent to {selectedPatient.phone}
              </p>
            )}
            {sendReminder && !selectedPatient?.phone && selectedPatient && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                <AlertCircle size={11} />
                No mobile number on file — reminder will not be sent
              </p>
            )}
          </Card>

          {/* Doctor */}
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Treating Doctor</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">Dr. Sipho Dlamini</p>
            <p className="text-xs text-muted-foreground">GP · Practice Nr: 0101234567</p>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={submitted}
            >
              <Calendar size={15} />
              {submitted ? "Booking appointment..." : "Confirm Booking"}
            </Button>
            <Link href="/appointments">
              <Button variant="ghost" className="w-full">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
