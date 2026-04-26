"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  X,
  ChevronRight,
  Banknote,
  ReceiptText,
  FileX,
  RefreshCw,
  Eye,
} from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentStatus = "Allocated" | "Partially Allocated" | "Unallocated"
type PaymentType = "MEDICAL_AID" | "PATIENT_CASH" | "PATIENT_CARD" | "PATIENT_EFT" | "WRITE_OFF" | "CREDIT_NOTE"
type Tab = "payments" | "reconcile" | "age-analysis"

interface Payment {
  id: string
  type: PaymentType
  from: string
  ref: string
  date: string
  amount: number
  invoices: number
  status: PaymentStatus
  scheme?: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const PAYMENTS: Payment[] = [
  { id: "pay-1", type: "MEDICAL_AID", from: "Discovery Health", ref: "DISC-RA-2026042501", date: "2026-04-25", amount: 4250.00, invoices: 5, status: "Allocated", scheme: "Discovery Health" },
  { id: "pay-2", type: "PATIENT_CARD", from: "Lungelo Dube", ref: "POS-20260425-001", date: "2026-04-25", amount: 500.00, invoices: 1, status: "Allocated" },
  { id: "pay-3", type: "MEDICAL_AID", from: "GEMS", ref: "GEMS-RA-2026042201", date: "2026-04-22", amount: 8640.00, invoices: 8, status: "Partially Allocated", scheme: "GEMS" },
  { id: "pay-4", type: "PATIENT_EFT", from: "Robert Khumalo", ref: "EFT-20260420-003", date: "2026-04-20", amount: 1250.00, invoices: 1, status: "Unallocated" },
  { id: "pay-5", type: "MEDICAL_AID", from: "Bonitas", ref: "BON-RA-2026041801", date: "2026-04-18", amount: 6100.00, invoices: 7, status: "Allocated", scheme: "Bonitas" },
  { id: "pay-6", type: "PATIENT_CASH", from: "Fatima Patel", ref: "CASH-20260417-002", date: "2026-04-17", amount: 350.00, invoices: 1, status: "Allocated" },
  { id: "pay-7", type: "WRITE_OFF", from: "Ayanda Zulu (write-off)", ref: "WO-20260415-001", date: "2026-04-15", amount: 120.00, invoices: 1, status: "Allocated" },
  { id: "pay-8", type: "CREDIT_NOTE", from: "Discovery Health", ref: "CN-DISC-2026041001", date: "2026-04-10", amount: 480.00, invoices: 1, status: "Allocated", scheme: "Discovery Health" },
]

const ALLOCATION_INVOICES = [
  { invoice: "INV-20260423-00011", patient: "Robert Khumalo", date: "2026-04-23", billed: 1250.00, scheme: "Self Pay" },
  { invoice: "INV-20260420-00009", patient: "Robert Khumalo", date: "2026-04-20", billed: 850.00, scheme: "Self Pay" },
]

const AUTO_MATCHED = [
  { invoice: "INV-20260424-00012", patient: "Fatima Patel", claimed: 1200.00, paid: 1200.00, match: "Exact" as const, scheme: "Bonitas" },
  { invoice: "INV-20260423-00010", patient: "Robert Khumalo", claimed: 980.00, paid: 850.00, match: "Partial" as const, diff: -130.00, scheme: "GEMS" },
  { invoice: "INV-20260422-00008", patient: "Ayanda Zulu", claimed: 650.00, paid: 650.00, match: "Exact" as const, scheme: "Discovery Health" },
]

const UNMATCHED = [
  { ref: "DISC-REF-9901", amount: 340.00, reason: "No matching invoice found" },
]

const AGE_ANALYSIS = [
  { name: "Discovery Health",       current: 850.00,  d30: 0,       d60: 0,      d90: 0,     d120: 0 },
  { name: "GEMS",                   current: 420.00,  d30: 0,       d60: 0,      d90: 0,     d120: 0 },
  { name: "Bonitas",                current: 0,       d30: 1100.00, d60: 0,      d90: 0,     d120: 0 },
  { name: "Lungelo Dube",           current: 1250.00, d30: 0,       d60: 0,      d90: 0,     d120: 0 },
  { name: "Robert Khumalo",         current: 0,       d30: 3400.00, d60: 0,      d90: 0,     d120: 0 },
  { name: "Priya Naicker",          current: 980.50,  d30: 0,       d60: 0,      d90: 0,     d120: 0 },
  { name: "James van der Merwe",    current: 750.00,  d30: 0,       d60: 750.00, d90: 0,     d120: 0 },
  { name: "Ayanda Zulu",            current: 0,       d30: 0,       d60: 0,      d90: 450.00, d120: 0 },
  { name: "Nomsa Sithole",          current: 0,       d30: 0,       d60: 0,      d90: 0,     d120: 680.00 },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PaymentType, { label: string; cls: string; icon: typeof CreditCard }> = {
  MEDICAL_AID:  { label: "Medical Aid",  cls: "bg-primary/10 text-primary border-primary/20",           icon: CreditCard },
  PATIENT_CASH: { label: "Cash",         cls: "bg-green-100 text-green-700 border-green-200",            icon: Banknote },
  PATIENT_CARD: { label: "Card",         cls: "bg-violet-100 text-violet-700 border-violet-200",         icon: CreditCard },
  PATIENT_EFT:  { label: "EFT",          cls: "bg-yellow-100 text-yellow-700 border-yellow-200",         icon: ReceiptText },
  WRITE_OFF:    { label: "Write Off",    cls: "bg-red-100 text-red-600 border-red-200",                  icon: FileX },
  CREDIT_NOTE:  { label: "Credit Note",  cls: "bg-muted text-muted-foreground border-border",            icon: ReceiptText },
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  "Allocated":           "bg-green-50 text-green-700 border-green-200",
  "Partially Allocated": "bg-blue-50 text-blue-700 border-blue-200",
  "Unallocated":         "bg-yellow-50 text-yellow-700 border-yellow-200",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(val: number) {
  return `R ${val.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Record Payment Modal ───────────────────────────────────────────────────────

function RecordPaymentModal({ onClose }: { onClose: () => void }) {
  const [payType, setPayType] = useState<PaymentType>("PATIENT_CASH")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Record Payment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Payment type */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Payment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["MEDICAL_AID", "PATIENT_CASH", "PATIENT_CARD", "PATIENT_EFT", "WRITE_OFF", "CREDIT_NOTE"] as PaymentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setPayType(t)}
                  className={cn(
                    "px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                    payType === t
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  )}
                >
                  {TYPE_LABELS[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* From */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              {payType === "MEDICAL_AID" ? "Medical Aid Scheme" : "Patient Name"}
            </label>
            <Input
              placeholder={payType === "MEDICAL_AID" ? "e.g. Discovery Health" : "e.g. Robert Khumalo"}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Amount (R)</label>
              <Input placeholder="0.00" type="number" min="0" step="0.01" className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date Received</label>
              <Input type="date" defaultValue="2026-04-25" className="text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Reference Number</label>
            <Input placeholder="e.g. EFT ref, RA number, POS ref" className="text-sm" />
          </div>

          {payType === "WRITE_OFF" && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700">
                <strong>Write-offs</strong> are permanent and cannot be reversed. Ensure the amount is approved by the practice manager before proceeding.
              </p>
            </div>
          )}

          {/* Link to invoice */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Link to Invoice (optional)</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search invoice number or patient..." className="pl-9 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notes (optional)</label>
            <textarea
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} className="gap-2">
            <CheckCircle size={14} />
            Record Payment
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Allocation Modal ───────────────────────────────────────────────────────────

function AllocationModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const allocated = selected.reduce((s, id) => {
    const inv = ALLOCATION_INVOICES.find(i => i.invoice === id)
    return s + (inv?.billed ?? 0)
  }, 0)
  const remaining = payment.amount - allocated

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Allocate Payment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{payment.ref} · {fmt(payment.amount)}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Summary bar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40">
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground">Total Payment</p>
              <p className="text-base font-bold text-foreground">{fmt(payment.amount)}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground">Allocated</p>
              <p className="text-base font-bold text-green-600">{fmt(allocated)}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={cn("text-base font-bold", remaining < 0 ? "text-destructive" : remaining === 0 ? "text-green-600" : "text-yellow-700")}>
                {fmt(remaining)}
              </p>
            </div>
          </div>

          {/* Invoice list */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Select invoices to allocate against</p>
            <div className="space-y-2">
              {ALLOCATION_INVOICES.map((inv) => {
                const isSelected = selected.includes(inv.invoice)
                return (
                  <div
                    key={inv.invoice}
                    onClick={() => setSelected(prev => isSelected ? prev.filter(i => i !== inv.invoice) : [...prev, inv.invoice])}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-primary border-primary" : "border-muted-foreground")}>
                      {isSelected && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium text-foreground">{inv.invoice}</p>
                      <p className="text-xs text-muted-foreground">{inv.patient} · {inv.date} · {inv.scheme}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{fmt(inv.billed)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose} disabled={selected.length === 0} className="gap-2">
            <CheckCircle size={14} />
            Save Allocation
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("payments")
  const [dragging, setDragging] = useState(false)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<PaymentType | "ALL">("ALL")
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [allocatingPayment, setAllocatingPayment] = useState<Payment | null>(null)

  const totalReceived   = PAYMENTS.filter(p => p.type !== "WRITE_OFF" && p.type !== "CREDIT_NOTE").reduce((s, p) => s + p.amount, 0)
  const totalMedAid     = PAYMENTS.filter(p => p.type === "MEDICAL_AID").reduce((s, p) => s + p.amount, 0)
  const totalPatient    = PAYMENTS.filter(p => ["PATIENT_CASH","PATIENT_CARD","PATIENT_EFT"].includes(p.type)).reduce((s, p) => s + p.amount, 0)
  const totalUnallocated= PAYMENTS.filter(p => p.status === "Unallocated").reduce((s, p) => s + p.amount, 0)

  const filteredPayments = PAYMENTS.filter(p => {
    const matchSearch = !search || p.from.toLowerCase().includes(search.toLowerCase()) || p.ref.toLowerCase().includes(search.toLowerCase())
    const matchType   = filterType === "ALL" || p.type === filterType
    return matchSearch && matchType
  })

  const ageGrandTotal = AGE_ANALYSIS.reduce((s, r) => s + r.current + r.d30 + r.d60 + r.d90 + r.d120, 0)
  const ageCol = (key: keyof typeof AGE_ANALYSIS[0]) => AGE_ANALYSIS.reduce((s, r) => s + (r[key] as number), 0)

  return (
    <AppShell title="Payments & Reconciliation" subtitle="Record payments, upload remittance advice, allocate receipts and view age analysis">

      {/* Modals */}
      {showRecordModal && <RecordPaymentModal onClose={() => setShowRecordModal(false)} />}
      {allocatingPayment && <AllocationModal payment={allocatingPayment} onClose={() => setAllocatingPayment(null)} />}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {([
          { id: "payments",     label: "Payments",                icon: CreditCard },
          { id: "reconcile",    label: "Remittance & Reconcile",  icon: RefreshCw },
          { id: "age-analysis", label: "Age Analysis",            icon: ReceiptText },
        ] as const).map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={15} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── PAYMENTS TAB ────────────────────────────────────────────────── */}
      {tab === "payments" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Received (Apr)",     value: fmt(totalReceived),    sub: "Medical aid + patient",  color: "text-foreground",   bg: "bg-primary/10",  icon: CreditCard },
              { label: "Medical Aid Payments",     value: fmt(totalMedAid),      sub: "From schemes",           color: "text-primary",      bg: "bg-primary/10",  icon: CreditCard },
              { label: "Patient Payments",         value: fmt(totalPatient),     sub: "Cash/Card/EFT",          color: "text-green-600",    bg: "bg-green-100",   icon: Banknote },
              { label: "Unallocated",              value: fmt(totalUnallocated), sub: "Needs allocation",       color: totalUnallocated > 0 ? "text-yellow-700" : "text-green-600", bg: totalUnallocated > 0 ? "bg-yellow-100" : "bg-green-100", icon: AlertCircle },
            ].map((s) => {
              const Icon = s.icon
              return (
                <Card key={s.label} className="p-4 flex items-start gap-3">
                  <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", s.bg)}>
                    <Icon size={18} className={s.color} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-xl font-bold truncate", s.color)}>{s.value}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm w-56"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as PaymentType | "ALL")}
                className="h-9 px-3 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ALL">All Types</option>
                {(Object.keys(TYPE_LABELS) as PaymentType[]).map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t].label}</option>
                ))}
              </select>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                <Download size={14} />
                Export
              </Button>
            </div>
            <Button onClick={() => setShowRecordModal(true)} className="gap-2 shrink-0">
              <Plus size={15} />
              Record Payment
            </Button>
          </div>

          {/* Payment table */}
          <Card>
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border bg-muted/30 rounded-t-xl">
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</div>
              <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reference</div>
              <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</div>
              <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Status</div>
              <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Action</div>
            </div>
            <div className="divide-y divide-border">
              {filteredPayments.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No payments match your filters.</p>
                </div>
              ) : filteredPayments.map((pay) => {
                const typeInfo = TYPE_LABELS[pay.type]
                return (
                  <div key={pay.id} className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    <div className="col-span-2">
                      <Badge variant="outline" className={cn("text-xs font-medium", typeInfo.cls)}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{pay.from}</p>
                      <p className="text-xs text-muted-foreground">{pay.invoices} invoice{pay.invoices !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="col-span-3 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground truncate">{pay.ref}</p>
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-muted-foreground">{pay.date.slice(5)}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-sm font-semibold text-foreground">{fmt(pay.amount)}</p>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Badge variant="outline" className={cn("text-xs", STATUS_STYLES[pay.status])}>
                        {pay.status}
                      </Badge>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {pay.status !== "Allocated" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-primary hover:text-primary"
                          onClick={() => setAllocatingPayment(pay)}
                        >
                          Allocate <ChevronRight size={12} />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                          <Eye size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Write-off / Credit Note quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Card className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FileX size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Write Off Bad Debt</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Write off uncollectable amounts. Requires manager approval. The original invoice remains on file for SARS purposes.
                </p>
                <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5">
                  <FileX size={12} />
                  New Write-Off
                </Button>
              </div>
            </Card>
            <Card className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                <ReceiptText size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Issue Credit Note</h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Reverse a billing error or overpayment by issuing a credit note against an existing invoice.
                </p>
                <Button variant="outline" size="sm" className="mt-3 text-xs gap-1.5">
                  <ReceiptText size={12} />
                  New Credit Note
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ── RECONCILE TAB ───────────────────────────────────────────────── */}
      {tab === "reconcile" && (
        <div className="space-y-6">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              Upload your medical aid remittance advice (RA) file. Med Diary will automatically match payments to invoices and flag any discrepancies for your review.
            </p>
          </div>

          {/* Upload zone */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Upload Remittance Advice</h3>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/20"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={() => setDragging(false)}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Upload size={28} className="text-primary" />
              </div>
              <p className="font-semibold text-foreground">Drop your remittance advice file here</p>
              <p className="text-sm text-muted-foreground mt-1.5">Supports PDF, CSV, XLSX, EDIFACT · Max 20 MB</p>
              <div className="flex items-center justify-center gap-3 mt-5">
                <Button variant="outline" className="gap-2">
                  <Upload size={14} />
                  Browse Files
                </Button>
                <span className="text-xs text-muted-foreground">or</span>
                <Button variant="ghost" className="gap-2 text-sm">
                  Fetch from HealthBridge
                </Button>
              </div>
            </div>
          </Card>

          {/* Auto-matched */}
          <Card>
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Auto-Matched Items</h3>
                <p className="text-xs text-muted-foreground">System matched {AUTO_MATCHED.length} line items</p>
              </div>
              <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200">
                {AUTO_MATCHED.length} matched
              </Badge>
            </div>
            <div className="divide-y divide-border">
              {AUTO_MATCHED.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold font-mono text-foreground">{item.invoice}</p>
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{item.scheme}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.patient}</p>
                  </div>
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <p className="text-xs text-muted-foreground">Claimed</p>
                      <p className="text-sm font-medium text-foreground">{fmt(item.claimed)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className={cn("text-sm font-semibold", item.paid === item.claimed ? "text-green-600" : "text-yellow-700")}>
                        {fmt(item.paid)}
                      </p>
                    </div>
                    {item.match === "Partial" && "diff" in item && (
                      <div>
                        <p className="text-xs text-muted-foreground">Diff</p>
                        <p className="text-sm font-semibold text-destructive">{fmt(item.diff!)}</p>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={item.match === "Exact"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {item.match} Match
                    </Badge>
                    <button className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">Review</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end px-5 py-3.5 border-t border-border bg-muted/10">
              <Button size="sm" className="gap-2">
                <CheckCircle size={14} />
                Accept All Exact Matches
              </Button>
            </div>
          </Card>

          {/* Unmatched */}
          <Card>
            <div className="flex items-center gap-3 p-5 border-b border-border">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Unmatched Items</h3>
                <p className="text-xs text-muted-foreground">Require manual review</p>
              </div>
              <Badge variant="outline" className="ml-auto bg-yellow-50 text-yellow-700 border-yellow-200">
                {UNMATCHED.length} unmatched
              </Badge>
            </div>
            {UNMATCHED.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Ref: {item.ref}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Amount: {fmt(item.amount)} · {item.reason}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="text-xs">Match Manually</Button>
                  <Button variant="outline" size="sm" className="text-xs">Create Invoice</Button>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Ignore</Button>
                </div>
              </div>
            ))}
          </Card>

          {/* Shortfall / Partial payers note */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-3">Partial Payment Workflow</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              When a medical aid pays less than billed (e.g. GEMS paid R850 vs R980 claimed), choose what happens to the balance:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Patient Liable",  desc: "Move shortfall to patient co-payment",      variant: "default" as const },
                { label: "Write Off",       desc: "Write off the difference as an adjustment",  variant: "outline" as const },
                { label: "Dispute Claim",   desc: "Flag for resubmission or dispute",           variant: "outline" as const },
              ].map((opt) => (
                <button
                  key={opt.label}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/20 text-left transition-all"
                >
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── AGE ANALYSIS TAB ────────────────────────────────────────────── */}
      {tab === "age-analysis" && (
        <div className="space-y-6">
          {/* Summary totals */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Current",    val: ageCol("current"), cls: "text-foreground",  bg: "bg-primary/10" },
              { label: "30 Days",    val: ageCol("d30"),     cls: "text-yellow-700",  bg: "bg-yellow-100" },
              { label: "60 Days",    val: ageCol("d60"),     cls: "text-orange-700",  bg: "bg-orange-100" },
              { label: "90 Days",    val: ageCol("d90"),     cls: "text-red-600",     bg: "bg-red-100" },
              { label: "120+ Days",  val: ageCol("d120"),    cls: "text-red-700",     bg: "bg-red-200" },
            ].map((s) => (
              <Card key={s.label} className="p-4">
                <p className={cn("text-lg font-bold", s.cls)}>{fmt(s.val)}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{s.label}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-full", s.bg)} style={{ width: ageGrandTotal > 0 ? `${(s.val / ageGrandTotal) * 100}%` : "0%" }} />
                </div>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-semibold text-foreground">Debtors Age Analysis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">As at 25 April 2026 · Total outstanding: {fmt(ageGrandTotal)}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download size={13} />
                Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Debtor</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-yellow-700 uppercase tracking-wide">30 Days</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-orange-700 uppercase tracking-wide">60 Days</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-red-600 uppercase tracking-wide">90 Days</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-red-700 uppercase tracking-wide">120+ Days</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {AGE_ANALYSIS.map((row) => {
                    const total = row.current + row.d30 + row.d60 + row.d90 + row.d120
                    const hasOverdue = row.d60 > 0 || row.d90 > 0 || row.d120 > 0
                    return (
                      <tr key={row.name} className={cn("hover:bg-muted/20 transition-colors", hasOverdue && "bg-red-50/30")}>
                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{row.name}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-foreground">{row.current > 0 ? fmt(row.current) : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-yellow-600 font-medium">{row.d30 > 0 ? fmt(row.d30) : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-orange-600 font-medium">{row.d60 > 0 ? fmt(row.d60) : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-red-600 font-semibold">{row.d90 > 0 ? fmt(row.d90) : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-red-700 font-bold">{row.d120 > 0 ? fmt(row.d120) : "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-right font-bold text-foreground">{fmt(total)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30 font-bold">
                    <td className="px-5 py-3 text-sm text-foreground">TOTAL</td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{ageCol("current") > 0 ? fmt(ageCol("current")) : "—"}</td>
                    <td className="px-4 py-3 text-sm text-right text-yellow-700">{ageCol("d30") > 0 ? fmt(ageCol("d30")) : "—"}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-700">{ageCol("d60") > 0 ? fmt(ageCol("d60")) : "—"}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{ageCol("d90") > 0 ? fmt(ageCol("d90")) : "—"}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-700">{ageCol("d120") > 0 ? fmt(ageCol("d120")) : "—"}</td>
                    <td className="px-5 py-3 text-sm text-right text-foreground">{fmt(ageGrandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Overdue escalation notice */}
          {ageCol("d120") > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
              <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">120+ Day Outstanding Balances</p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                  {fmt(ageCol("d120"))} has been outstanding for more than 120 days. Consider escalating these accounts to a debt collector or writing them off after following the HPCSA ethical guidelines.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
