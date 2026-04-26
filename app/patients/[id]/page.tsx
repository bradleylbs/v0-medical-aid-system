"use client"

import { use, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MOCK_PATIENTS,
  MOCK_INVOICES,
  MOCK_CLAIMS,
  MOCK_BENEFIT_CHECKS,
  MOCK_PATIENT_PAYMENTS,
} from "@/lib/mock-data"
import {
  ChevronLeft,
  FileText,
  CreditCard,
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  Shield,
  User,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Printer,
  Plus,
  Clock,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"

type TabId = "invoices" | "claims" | "payments" | "benefits"

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "invoices",  label: "Invoices",       icon: FileText },
  { id: "claims",    label: "Claims",         icon: Activity },
  { id: "payments",  label: "Payments",       icon: CreditCard },
  { id: "benefits",  label: "Benefit Checks", icon: Stethoscope },
]

const STATUS_INVOICE: Record<string, { label: string; cls: string }> = {
  DRAFT:          { label: "Draft",           cls: "bg-muted text-muted-foreground" },
  SUBMITTED:      { label: "Submitted",       cls: "bg-blue-100 text-blue-700" },
  PARTIALLY_PAID: { label: "Partially Paid",  cls: "bg-yellow-100 text-yellow-700" },
  PAID:           { label: "Paid",            cls: "bg-green-100 text-green-700" },
  REJECTED:       { label: "Rejected",        cls: "bg-red-100 text-red-600" },
  WRITTEN_OFF:    { label: "Written Off",     cls: "bg-muted text-muted-foreground" },
  CANCELLED:      { label: "Cancelled",       cls: "bg-muted text-muted-foreground" },
}

const STATUS_CLAIM: Record<string, { label: string; cls: string }> = {
  PENDING:            { label: "Pending",      cls: "bg-muted text-muted-foreground" },
  SUBMITTED:          { label: "Submitted",    cls: "bg-blue-100 text-blue-700" },
  ACCEPTED:           { label: "Accepted",     cls: "bg-green-100 text-green-700" },
  PARTIALLY_ACCEPTED: { label: "Part. Accept", cls: "bg-yellow-100 text-yellow-700" },
  REJECTED:           { label: "Rejected",     cls: "bg-red-100 text-red-600" },
  RESUBMITTED:        { label: "Resubmitted",  cls: "bg-primary/10 text-primary" },
}

const STATUS_PAYMENT: Record<string, { label: string; cls: string }> = {
  ALLOCATED:           { label: "Allocated",         cls: "bg-green-100 text-green-700" },
  PARTIALLY_ALLOCATED: { label: "Part. Allocated",   cls: "bg-yellow-100 text-yellow-700" },
  UNALLOCATED:         { label: "Unallocated",       cls: "bg-muted text-muted-foreground" },
}

const PAYMENT_TYPE_LABEL: Record<string, string> = {
  MEDICAL_AID:   "Medical Aid",
  PATIENT_CASH:  "Cash",
  PATIENT_CARD:  "Card",
  PATIENT_EFT:   "EFT",
  WRITE_OFF:     "Write-off",
  CREDIT_NOTE:   "Credit Note",
}

const BENEFIT_STATUS: Record<string, { label: string; cls: string }> = {
  SUCCESS: { label: "Success", cls: "bg-green-100 text-green-700" },
  FAILED:  { label: "Failed",  cls: "bg-red-100 text-red-600" },
  PENDING: { label: "Pending", cls: "bg-muted text-muted-foreground" },
}

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const patient = MOCK_PATIENTS.find(p => p.id === id) ?? MOCK_PATIENTS[0]

  const invoices = MOCK_INVOICES.filter(inv => inv.patientId === id)
  const claims = MOCK_CLAIMS.filter(c =>
    invoices.some(inv => inv.id === c.invoiceId)
  )
  const payments = MOCK_PATIENT_PAYMENTS.filter(p => p.patientId === id)
  const benefitChecks = MOCK_BENEFIT_CHECKS.filter(b => b.patientId === id)

  const [activeTab, setActiveTab] = useState<TabId>("invoices")
  const [runningCheck, setRunningCheck] = useState(false)

  const handleBenefitCheck = () => {
    setRunningCheck(true)
    setTimeout(() => setRunningCheck(false), 2000)
  }

  // Summary stats
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.outstanding, 0)
  const acceptedClaims = claims.filter(c => c.status === "ACCEPTED").length
  const rejectedClaims = claims.filter(c => c.status === "REJECTED").length

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
                <span className="font-medium font-mono">{patient.idNumber ?? "Not captured"}</span>
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

            <div className="mt-4 pt-4 border-t border-border flex gap-2">
              <Link href={`/patients/${id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1.5">
                  <User size={13} /> Edit
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                <Printer size={13} /> Statement
              </Button>
            </div>
          </Card>

          {/* Medical Aid card */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Medical Aid</h3>
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
              {patient.membershipNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={() => { setActiveTab("benefits"); handleBenefitCheck() }}
                  disabled={runningCheck}
                >
                  <Stethoscope size={14} />
                  {runningCheck ? "Checking benefits..." : "Check Benefits"}
                </Button>
              )}
              {!patient.membershipNumber && (
                <div className="flex items-center gap-2 text-xs text-yellow-600">
                  <AlertCircle size={12} />
                  Cash patient — no scheme linked
                </div>
              )}
            </div>
          </Card>

          {/* Financial summary */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="font-semibold text-foreground">Financial Summary</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total billed</span>
                <span className="font-semibold text-foreground">R {totalBilled.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding</span>
                <span className={cn("font-semibold", totalOutstanding > 0 ? "text-yellow-600" : "text-green-600")}>
                  R {totalOutstanding.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Claims accepted</span>
                <span className="font-semibold text-green-600">{acceptedClaims}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claims rejected</span>
                <span className={cn("font-semibold", rejectedClaims > 0 ? "text-red-600" : "text-muted-foreground")}>
                  {rejectedClaims}
                </span>
              </div>
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

        {/* Right: Tabbed content */}
        <div className="xl:col-span-2">
          <Card>
            {/* Tab bar */}
            <div className="flex border-b border-border overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon
                const count =
                  tab.id === "invoices" ? invoices.length
                  : tab.id === "claims" ? claims.length
                  : tab.id === "payments" ? payments.length
                  : benefitChecks.length
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {count > 0 && (
                      <span className={cn(
                        "ml-1 px-1.5 py-0.5 rounded text-xs font-semibold",
                        activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab: Invoices */}
            {activeTab === "invoices" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <p className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
                  <Link href={`/invoices/new?patient=${id}`}>
                    <Button size="sm" className="gap-1.5 h-7 text-xs">
                      <Plus size={12} /> New Invoice
                    </Button>
                  </Link>
                </div>
                {invoices.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <FileText size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No invoices yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {invoices.map(inv => {
                      const statusInfo = STATUS_INVOICE[inv.status] ?? STATUS_INVOICE.DRAFT
                      return (
                        <Link
                          key={inv.id}
                          href={`/invoices/${inv.id}`}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold font-mono text-foreground">{inv.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground">{inv.dateOfService} · {inv.scheme}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground">R {inv.total.toFixed(2)}</p>
                            {inv.outstanding > 0 && (
                              <p className="text-xs text-yellow-600">Outstanding: R {inv.outstanding.toFixed(2)}</p>
                            )}
                          </div>
                          <Badge className={cn("text-xs font-medium shrink-0", statusInfo.cls)} variant="outline">
                            {statusInfo.label}
                          </Badge>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Claims */}
            {activeTab === "claims" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <p className="text-sm text-muted-foreground">{claims.length} claim{claims.length !== 1 ? "s" : ""} submitted</p>
                </div>
                {claims.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <Activity size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No claims submitted yet</p>
                    <p className="text-xs mt-1">Claims are created when an invoice is submitted to a medical aid</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {claims.map(claim => {
                      const statusInfo = STATUS_CLAIM[claim.status] ?? STATUS_CLAIM.PENDING
                      return (
                        <Link
                          key={claim.id}
                          href={`/claims/${claim.id}`}
                          className="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold font-mono text-foreground">{claim.invoiceNumber}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{claim.scheme} · Submitted {claim.submittedAt}</p>
                            {claim.switchRef && (
                              <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">Ref: {claim.switchRef}</p>
                            )}
                            {claim.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle size={11} />
                                {claim.rejectionReason}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground">R {claim.amount.toFixed(2)}</p>
                            <Badge className={cn("text-xs font-medium mt-1", statusInfo.cls)} variant="outline">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Payments */}
            {activeTab === "payments" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <p className="text-sm text-muted-foreground">{payments.length} payment{payments.length !== 1 ? "s" : ""} recorded</p>
                  <Link href={`/payments?patient=${id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
                      <Plus size={12} /> Record Payment
                    </Button>
                  </Link>
                </div>
                {payments.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <CreditCard size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {payments.map(pay => {
                      const statusInfo = STATUS_PAYMENT[pay.status] ?? STATUS_PAYMENT.UNALLOCATED
                      return (
                        <div key={pay.id} className="flex items-start gap-4 px-5 py-4">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            pay.paymentType === "MEDICAL_AID" ? "bg-blue-100" :
                            pay.paymentType === "WRITE_OFF" ? "bg-muted" : "bg-green-100"
                          )}>
                            <CreditCard size={15} className={
                              pay.paymentType === "MEDICAL_AID" ? "text-blue-600" :
                              pay.paymentType === "WRITE_OFF" ? "text-muted-foreground" : "text-green-600"
                            } />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {PAYMENT_TYPE_LABEL[pay.paymentType] ?? pay.paymentType}
                              </p>
                              <Badge className={cn("text-xs", statusInfo.cls)} variant="outline">
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {pay.paymentDate} · Ref: {pay.reference ?? "—"}
                            </p>
                            {pay.invoiceNumber && (
                              <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
                                Applied to {pay.invoiceNumber}
                              </p>
                            )}
                            {pay.scheme && (
                              <p className="text-xs text-muted-foreground mt-0.5">{pay.scheme}</p>
                            )}
                          </div>
                          <p className="text-sm font-bold text-foreground shrink-0">
                            R {pay.amount.toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                    <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                      <span className="text-sm font-semibold text-foreground">Total received</span>
                      <span className="text-sm font-bold text-foreground">
                        R {payments.reduce((s, p) => s + p.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Benefit Checks */}
            {activeTab === "benefits" && (
              <div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <p className="text-sm text-muted-foreground">{benefitChecks.length} check{benefitChecks.length !== 1 ? "s" : ""} performed</p>
                  {patient.membershipNumber && (
                    <Button
                      size="sm"
                      className="gap-1.5 h-7 text-xs"
                      onClick={handleBenefitCheck}
                      disabled={runningCheck}
                    >
                      <RefreshCw size={12} className={runningCheck ? "animate-spin" : ""} />
                      {runningCheck ? "Checking..." : "New Check"}
                    </Button>
                  )}
                </div>

                {runningCheck && (
                  <div className="px-5 py-4 border-b border-border bg-primary/5">
                    <div className="flex items-center gap-3 text-sm text-primary">
                      <RefreshCw size={14} className="animate-spin" />
                      Querying {patient.scheme} via SwitchComm...
                    </div>
                  </div>
                )}

                {!patient.membershipNumber && (
                  <div className="py-10 px-5 text-center text-muted-foreground">
                    <Stethoscope size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Benefit checks are not available for cash patients</p>
                  </div>
                )}

                {patient.membershipNumber && benefitChecks.length === 0 && !runningCheck && (
                  <div className="py-16 text-center text-muted-foreground">
                    <Stethoscope size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No benefit checks performed yet</p>
                    <p className="text-xs mt-1">Click &quot;New Check&quot; to query this member&apos;s current benefits</p>
                  </div>
                )}

                {benefitChecks.length > 0 && (
                  <div className="divide-y divide-border">
                    {benefitChecks.map(check => {
                      const statusInfo = BENEFIT_STATUS[check.status] ?? BENEFIT_STATUS.PENDING
                      return (
                        <div key={check.id} className="px-5 py-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{check.scheme}</p>
                                <Badge className={cn("text-xs", statusInfo.cls)} variant="outline">
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <Clock size={11} className="inline mr-1" />
                                Performed {check.performedAt}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              {check.isActiveMember ? (
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                  <CheckCircle size={12} /> Active Member
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                  <AlertCircle size={12} /> Inactive
                                </span>
                              )}
                            </div>
                          </div>

                          {check.status === "SUCCESS" && (
                            <div className="grid grid-cols-3 gap-3">
                              {check.planOption && (
                                <div className="col-span-3">
                                  <p className="text-xs text-muted-foreground">Plan Option</p>
                                  <p className="text-sm font-medium text-foreground">{check.planOption}</p>
                                </div>
                              )}
                              {check.savingsAvailable != null && (
                                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                                  <p className="text-xs text-muted-foreground">Savings</p>
                                  <p className="text-base font-bold text-foreground mt-0.5">
                                    R {check.savingsAvailable.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              )}
                              {check.dayToDayAvailable != null && (
                                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                                  <p className="text-xs text-muted-foreground">Day-to-Day</p>
                                  <p className="text-base font-bold text-foreground mt-0.5">
                                    R {check.dayToDayAvailable.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              )}
                              {check.hospitalAvailable != null && (
                                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                                  <p className="text-xs text-muted-foreground">Hospital</p>
                                  <p className="text-base font-bold text-foreground mt-0.5">
                                    R {check.hospitalAvailable.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
