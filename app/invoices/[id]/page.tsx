"use client"

import { use } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MOCK_INVOICES, MOCK_PATIENTS, TARIFF_CODES, ICD10_CODES } from "@/lib/mock-data"
import { ChevronLeft, Send, Download, Mail, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  DRAFT:          { label: "Draft",          cls: "bg-muted text-muted-foreground" },
  SUBMITTED:      { label: "Submitted",       cls: "bg-blue-100 text-blue-700" },
  PARTIALLY_PAID: { label: "Partially Paid",  cls: "bg-yellow-100 text-yellow-700" },
  PAID:           { label: "Paid",            cls: "bg-green-100 text-green-700" },
  REJECTED:       { label: "Rejected",        cls: "bg-red-100 text-red-600" },
  WRITTEN_OFF:    { label: "Written Off",     cls: "bg-muted text-muted-foreground" },
  CANCELLED:      { label: "Cancelled",       cls: "bg-muted text-muted-foreground" },
}

// Mock line items for the invoice
const MOCK_LINE_ITEMS = [
  { code: "0191", description: "Consultation, surgery, repeat patient", icd10: "J06.9", qty: 1, unitPrice: 365.00, nrpl: 365.00 },
  { code: "0185", description: "Injection (therapeutic)", icd10: "J06.9", qty: 1, unitPrice: 145.00, nrpl: 145.00 },
]

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const invoice = MOCK_INVOICES.find(i => i.id === id) ?? MOCK_INVOICES[0]
  const patient = MOCK_PATIENTS.find(p => p.id === invoice.patientId) ?? MOCK_PATIENTS[0]
  const statusInfo = STATUS_STYLES[invoice.status] ?? STATUS_STYLES.DRAFT

  return (
    <AppShell title={invoice.invoiceNumber} subtitle="Invoice detail">
      <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft size={15} /> Back to Invoices
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main invoice content */}
        <div className="xl:col-span-2 space-y-5">
          {/* Rejected warning */}
          {invoice.status === "REJECTED" && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Claim Rejected</p>
                <p className="text-xs mt-0.5">Prior authorisation was required and not obtained. Please obtain the authorisation number and resubmit.</p>
                <Button variant="destructive" size="sm" className="mt-3 text-xs">Resubmit Claim</Button>
              </div>
            </div>
          )}

          {/* Invoice header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold font-mono text-foreground">{invoice.invoiceNumber}</h2>
                  <Badge className={cn("text-xs font-medium", statusInfo.cls)} variant="outline">
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Date of Service: {invoice.dateOfService}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Practice:</p>
                <p className="text-sm font-semibold text-foreground">Dr. Sipho Dlamini</p>
                <p className="text-xs text-muted-foreground">BHF: GP-0012345 | HPCSA: MP0123456</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Patient</p>
                <p className="text-sm font-semibold text-foreground">{patient.firstName} {patient.lastName}</p>
                <p className="text-xs text-muted-foreground">{patient.idNumber ?? "No ID"}</p>
                <p className="text-xs text-muted-foreground">{patient.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Medical Aid</p>
                <p className="text-sm font-semibold text-foreground">{invoice.scheme}</p>
                <p className="text-xs text-muted-foreground">Membership: {patient.membershipNumber ?? "N/A"}</p>
                <p className="text-xs text-muted-foreground">Plan: {patient.planOption ?? "N/A"}</p>
              </div>
            </div>
          </Card>

          {/* Line items */}
          <Card>
            <div className="px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground">Line Items</h3>
            </div>
            <div className="divide-y divide-border">
              {MOCK_LINE_ITEMS.map((li, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center px-5 py-4">
                  <div className="col-span-1">
                    <Badge variant="outline" className="font-mono text-xs">{li.code}</Badge>
                  </div>
                  <div className="col-span-5">
                    <p className="text-sm text-foreground">{li.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className="text-[10px] bg-primary/10 text-primary font-mono py-0">{li.icd10}</Badge>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-muted-foreground">×{li.qty}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-xs text-muted-foreground">NRPL: R {li.nrpl.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-semibold text-foreground">R {(li.unitPrice * li.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-5 py-4 border-t border-border bg-muted/20">
              <div className="max-w-xs ml-auto space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R {invoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT</span>
                  <span>R 0.00</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground">
                  <span>Total</span>
                  <span>R {invoice.total.toFixed(2)}</span>
                </div>
                {invoice.medicalAidClaimed > 0 && (
                  <>
                    <div className="flex justify-between text-primary text-xs">
                      <span>Medical Aid Claimed</span>
                      <span>R {invoice.medicalAidClaimed.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {invoice.outstanding > 0 && (
                  <div className="flex justify-between text-yellow-700 text-xs font-semibold">
                    <span>Outstanding</span>
                    <span>R {invoice.outstanding.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar: actions + claim status */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4">Actions</h4>
            <div className="space-y-2">
              {invoice.status === "DRAFT" && (
                <Button className="w-full gap-2">
                  <Send size={14} />
                  Submit to Medical Aid
                </Button>
              )}
              {invoice.status === "REJECTED" && (
                <Button variant="destructive" className="w-full gap-2">
                  <Send size={14} />
                  Resubmit Claim
                </Button>
              )}
              <Button variant="outline" className="w-full gap-2">
                <Download size={14} />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Mail size={14} />
                Email to Patient
              </Button>
            </div>
          </Card>

          {/* Payment summary */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4">Payment Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Total</span>
                <span className="font-medium">R {invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MA Claimed</span>
                <span className="font-medium">R {invoice.medicalAidClaimed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MA Paid</span>
                <span className="font-medium">R {(invoice.total - invoice.outstanding).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className={cn("font-semibold", invoice.outstanding > 0 ? "text-yellow-700" : "text-green-700")}>
                  Outstanding
                </span>
                <span className={cn("font-bold", invoice.outstanding > 0 ? "text-yellow-700" : "text-green-700")}>
                  R {invoice.outstanding.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Claim timeline */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4">Claim Timeline</h4>
            <div className="space-y-3">
              {[
                { time: "25 Apr 09:10", event: "Invoice created", status: "done" },
                { time: "25 Apr 09:12", event: "Finalised & locked", status: "done" },
                ...(invoice.status !== "DRAFT" ? [{ time: "25 Apr 09:12", event: "Submitted to MediSwitch", status: "done" }] : []),
                ...(invoice.status === "SUBMITTED" ? [{ time: "Awaiting", event: "Scheme response pending", status: "pending" }] : []),
                ...(invoice.status === "PAID" ? [{ time: "25 Apr 16:00", event: "Payment received", status: "done" }] : []),
                ...(invoice.status === "REJECTED" ? [{ time: "25 Apr 15:00", event: "Claim rejected — Code 05", status: "error" }] : []),
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                    item.status === "done" ? "bg-green-500" :
                    item.status === "error" ? "bg-destructive" :
                    "bg-muted-foreground animate-pulse"
                  )} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.event}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
