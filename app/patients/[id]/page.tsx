"use client"

import { use } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MOCK_PATIENTS, MOCK_INVOICES } from "@/lib/mock-data"
import { ChevronLeft, FileText, CreditCard, Stethoscope, Phone, Mail, Calendar, Shield, User } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_INVOICE: Record<string, { label: string; cls: string }> = {
  DRAFT:           { label: "Draft",           cls: "bg-muted text-muted-foreground" },
  SUBMITTED:       { label: "Submitted",        cls: "bg-blue-100 text-blue-700" },
  PARTIALLY_PAID:  { label: "Partially Paid",   cls: "bg-yellow-100 text-yellow-700" },
  PAID:            { label: "Paid",             cls: "bg-green-100 text-green-700" },
  REJECTED:        { label: "Rejected",         cls: "bg-red-100 text-red-600" },
  WRITTEN_OFF:     { label: "Written Off",      cls: "bg-muted text-muted-foreground" },
  CANCELLED:       { label: "Cancelled",        cls: "bg-muted text-muted-foreground" },
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const patient = MOCK_PATIENTS.find(p => p.id === id) ?? MOCK_PATIENTS[0]
  const invoices = MOCK_INVOICES.filter(inv => inv.patientId === id)

  return (
    <AppShell title={`${patient.firstName} ${patient.lastName}`} subtitle="Patient Profile">
      {/* Back */}
      <Link href="/patients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft size={15} /> Back to Patients
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Patient info */}
        <div className="xl:col-span-1 space-y-4">
          {/* Profile card */}
          <Card className="p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-xl">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{patient.firstName} {patient.lastName}</h2>
                <p className="text-sm text-muted-foreground">{patient.gender} · DOB: {patient.dateOfBirth}</p>
                {patient.outstandingBalance > 0 ? (
                  <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200 mt-1">
                    Outstanding: R {patient.outstandingBalance.toFixed(2)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200 mt-1">Account Clear</Badge>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User size={15} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">SA ID:</span>
                <span className="font-medium">{patient.idNumber ?? "Not captured"}</span>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={15} className="text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail size={15} className="text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{patient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar size={15} className="text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Last Visit:</span>
                <span className="font-medium">{patient.lastVisit}</span>
              </div>
            </div>
          </Card>

          {/* Medical Aid card */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Medical Aid Details</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Scheme</p>
                <p className="font-medium">{patient.scheme}</p>
              </div>
              {patient.membershipNumber && (
                <div>
                  <p className="text-muted-foreground text-xs">Membership Number</p>
                  <p className="font-medium font-mono">{patient.membershipNumber}</p>
                </div>
              )}
              {patient.planOption && (
                <div>
                  <p className="text-muted-foreground text-xs">Plan Option</p>
                  <p className="font-medium">{patient.planOption}</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                <Stethoscope size={14} />
                Check Benefits
              </Button>
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Link href={`/invoices/new?patient=${id}`}>
              <Button className="w-full gap-2">
                <FileText size={15} />
                Create Invoice
              </Button>
            </Link>
            <Link href={`/appointments/new?patient=${id}`}>
              <Button variant="outline" className="w-full gap-2">
                <Calendar size={15} />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Invoices */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <FileText size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Invoice History</h3>
              <Badge variant="secondary" className="ml-auto">{invoices.length}</Badge>
            </div>
            {invoices.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p>No invoices yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {invoices.map((inv) => {
                  const statusInfo = STATUS_INVOICE[inv.status] ?? STATUS_INVOICE.DRAFT
                  return (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold font-mono text-foreground">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{inv.dateOfService} · {inv.scheme}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">R {inv.total.toFixed(2)}</p>
                        {inv.outstanding > 0 && (
                          <p className="text-xs text-yellow-600">Outstanding: R {inv.outstanding.toFixed(2)}</p>
                        )}
                      </div>
                      <Badge className={cn("text-xs font-medium", statusInfo.cls)} variant="outline">
                        {statusInfo.label}
                      </Badge>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
