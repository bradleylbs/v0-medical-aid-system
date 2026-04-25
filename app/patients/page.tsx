"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_PATIENTS } from "@/lib/mock-data"
import { UserPlus, Search, ChevronRight, Stethoscope, Phone, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PatientsPage() {
  const [search, setSearch] = useState("")

  const filtered = MOCK_PATIENTS.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.membershipNumber ?? "").toLowerCase().includes(q) ||
      p.scheme.toLowerCase().includes(q)
    )
  })

  return (
    <AppShell title="Patients" subtitle="Manage your patient register">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, membership no..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/patients/new">
          <Button className="gap-2">
            <UserPlus size={16} />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Patients", value: MOCK_PATIENTS.length.toString(), color: "text-primary" },
          { label: "With Outstanding", value: MOCK_PATIENTS.filter(p => p.outstandingBalance > 0).length.toString(), color: "text-yellow-600" },
          { label: "Cash Patients", value: MOCK_PATIENTS.filter(p => p.scheme === "Cash Patient").length.toString(), color: "text-foreground" },
          { label: "Medical Aid", value: MOCK_PATIENTS.filter(p => p.scheme !== "Cash Patient").length.toString(), color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Patient list */}
      <Card>
        <div className="divide-y divide-border">
          {filtered.map((patient) => (
            <Link
              key={patient.id}
              href={`/patients/${patient.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>

              {/* Patient info */}
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <div>
                  <p className="font-medium text-foreground">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{patient.idNumber ?? "No ID number"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground">{patient.scheme}</p>
                  <p className="text-xs text-muted-foreground">{patient.membershipNumber ?? "No membership"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {patient.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone size={11} /> {patient.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Outstanding badge */}
              <div className="shrink-0">
                {patient.outstandingBalance > 0 ? (
                  <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200 font-semibold">
                    R {patient.outstandingBalance.toFixed(2)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                    Clear
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => { e.preventDefault() }}
                >
                  <Stethoscope size={13} />
                  Benefits
                </Button>
                <ChevronRight size={16} className="text-muted-foreground" />
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No patients found</p>
              <p className="text-sm mt-1">Try adjusting your search</p>
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  )
}
