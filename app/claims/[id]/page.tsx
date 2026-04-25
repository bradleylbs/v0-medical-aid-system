"use client"

import { use } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MOCK_CLAIMS, REJECTION_CODES } from "@/lib/mock-data"
import { ChevronLeft, AlertTriangle, Send, Info, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "Submitted", cls: "bg-blue-100 text-blue-700" },
  ACCEPTED:  { label: "Accepted",  cls: "bg-green-100 text-green-700" },
  REJECTED:  { label: "Rejected",  cls: "bg-red-100 text-red-600" },
  PENDING:   { label: "Pending",   cls: "bg-muted text-muted-foreground" },
}

const EDIFACT_SAMPLE = `UNB+UNOA:1+MYPRACTICE+DISC+260425:0912+000001'
UNH+000001+MEDCLM:D:96A:UN'
BGM+935+CLM-20260425-001+9'
DTM+137:20260425:102'
NAD+PR+GP0012345:160:ZAF+DR. SIPHO DLAMINI'
NAD+IV+DISC:160:ZAF+DISCOVERY HEALTH'
NAD+PT+DH1234567:160++THEMBI NKOSI++++00'
LIN+1++0191:ZZZ'
PRI+AAB:36500:WH'
QTY+47:1:C62'
RFF+ICD:J06.9'
LIN+2++0185:ZZZ'
PRI+AAB:14500:WH'
QTY+47:1:C62'
RFF+ICD:J06.9'
UNT+14+000001'
UNZ+1+000001'`

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const claim = MOCK_CLAIMS.find(c => c.id === id) ?? MOCK_CLAIMS[0]
  const statusInfo = STATUS_STYLES[claim.status] ?? STATUS_STYLES.PENDING

  return (
    <AppShell title={`Claim — ${claim.invoiceNumber}`} subtitle="Claim detail and submission log">
      <Link href="/claims" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft size={15} /> Back to Claims
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-5">
          {/* Rejection notice */}
          {claim.status === "REJECTED" && (
            <div className="flex items-start gap-3 p-5 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">Claim Rejected — Code {claim.rejectionCode}</p>
                <p className="text-sm text-red-700 mt-1">{claim.rejectionReason ?? REJECTION_CODES[claim.rejectionCode ?? "UNKNOWN"]}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="destructive" size="sm" className="gap-1.5">
                    <Send size={13} /> Resubmit Claim
                  </Button>
                  <Button variant="outline" size="sm">Write Off</Button>
                </div>
              </div>
            </div>
          )}

          {/* Claim header */}
          <Card className="p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold font-mono">{claim.invoiceNumber}</h2>
                  <Badge className={cn("text-xs font-medium", statusInfo.cls)} variant="outline">
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Submitted: {claim.submittedAt}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">R {claim.amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Claim amount</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-medium">{claim.patientName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheme</p>
                <p className="font-medium">{claim.scheme}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Switch Ref</p>
                <p className="font-mono text-xs font-medium">{claim.switchRef ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Switch</p>
                <p className="font-medium">MediSwitch</p>
              </div>
            </div>
          </Card>

          {/* EDIFACT message */}
          <Card>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
              <Info size={15} className="text-muted-foreground" />
              <h3 className="font-semibold text-foreground">EDIFACT MEDCLM Message</h3>
            </div>
            <div className="p-5">
              <pre className="text-xs font-mono text-muted-foreground bg-muted/30 p-4 rounded-lg overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {EDIFACT_SAMPLE}
              </pre>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timeline */}
          <Card className="p-5">
            <h4 className="font-semibold text-foreground mb-4">Claim Timeline</h4>
            <div className="space-y-4">
              {[
                { icon: CheckCircle, color: "text-green-600", label: "Invoice finalised", time: claim.submittedAt, done: true },
                { icon: Send, color: "text-primary", label: "Submitted to MediSwitch", time: claim.submittedAt, done: true },
                ...(claim.status === "SUBMITTED" ? [
                  { icon: Clock, color: "text-blue-600", label: "Awaiting scheme response", time: "Pending...", done: false },
                ] : []),
                ...(claim.status === "ACCEPTED" ? [
                  { icon: CheckCircle, color: "text-green-600", label: "Claim accepted by scheme", time: claim.submittedAt, done: true },
                ] : []),
                ...(claim.status === "REJECTED" ? [
                  { icon: XCircle, color: "text-destructive", label: "Claim rejected", time: claim.submittedAt, done: true },
                ] : []),
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={cn("shrink-0 mt-0.5", item.done ? item.color : "text-muted-foreground")}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Retry info */}
          {claim.status === "REJECTED" && (
            <Card className="p-5">
              <h4 className="font-semibold text-foreground mb-3">Retry Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attempt</span>
                  <span className="font-medium">1 of 3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">4-month deadline</span>
                  <span className="font-medium text-green-600">Aug 25, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days remaining</span>
                  <span className="font-medium text-green-600">122 days</span>
                </div>
              </div>
            </Card>
          )}

          <Link href={`/invoices/${claim.invoiceId}`}>
            <Button variant="outline" className="w-full">
              View Original Invoice
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
