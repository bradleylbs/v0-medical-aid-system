"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CreditCard, Upload, CheckCircle, AlertCircle, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"

const PAYMENTS = [
  { id: "pay-1", type: "MEDICAL_AID", from: "Discovery Health", ref: "DISC-RA-2026042501", date: "2026-04-25", amount: 4250.00, invoices: 5, status: "Allocated" },
  { id: "pay-2", type: "PATIENT_CARD", from: "Lungelo Dube", ref: "POS-20260425-001", date: "2026-04-25", amount: 500.00, invoices: 1, status: "Allocated" },
  { id: "pay-3", type: "MEDICAL_AID", from: "GEMS", ref: "GEMS-RA-2026042201", date: "2026-04-22", amount: 8640.00, invoices: 8, status: "Partially Allocated" },
  { id: "pay-4", type: "PATIENT_EFT", from: "Robert Khumalo", ref: "EFT-20260420-003", date: "2026-04-20", amount: 1250.00, invoices: 1, status: "Unallocated" },
  { id: "pay-5", type: "MEDICAL_AID", from: "Bonitas", ref: "BON-RA-2026041801", date: "2026-04-18", amount: 6100.00, invoices: 7, status: "Allocated" },
]

const AGE_ANALYSIS = [
  { name: "Discovery Health", current: 850, d30: 0, d60: 0, d90: 0, d120: 0 },
  { name: "Lungelo Dube", current: 1250, d30: 0, d60: 0, d90: 0, d120: 0 },
  { name: "Robert Khumalo", current: 0, d30: 3400, d60: 0, d90: 0, d120: 0 },
  { name: "Priya Naicker", current: 980.50, d30: 0, d60: 0, d90: 0, d120: 0 },
  { name: "James van der Merwe", current: 750, d30: 0, d60: 0, d90: 0, d120: 0 },
]

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  MEDICAL_AID:   { label: "Medical Aid", cls: "bg-primary/10 text-primary" },
  PATIENT_CASH:  { label: "Cash", cls: "bg-green-100 text-green-700" },
  PATIENT_CARD:  { label: "Card", cls: "bg-purple-100 text-purple-700" },
  PATIENT_EFT:   { label: "EFT", cls: "bg-yellow-100 text-yellow-700" },
  WRITE_OFF:     { label: "Write Off", cls: "bg-red-100 text-red-600" },
  CREDIT_NOTE:   { label: "Credit Note", cls: "bg-muted text-muted-foreground" },
}

export default function PaymentsPage() {
  const [tab, setTab] = useState<"payments" | "reconcile" | "age-analysis">("payments")
  const [dragging, setDragging] = useState(false)

  const totalReceived = PAYMENTS.reduce((s, p) => s + p.amount, 0)
  const totalUnallocated = PAYMENTS.filter(p => p.status === "Unallocated").reduce((s, p) => s + p.amount, 0)

  return (
    <AppShell title="Payments & Reconciliation" subtitle="Record payments, upload remittance advice, view age analysis">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["payments", "reconcile", "age-analysis"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
              tab === t
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "payments" ? "Payments" : t === "reconcile" ? "Remittance & Reconcile" : "Age Analysis"}
          </button>
        ))}
      </div>

      {tab === "payments" && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Received (Apr)", value: `R ${totalReceived.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`, sub: "This month", color: "text-foreground" },
              { label: "Medical Aid Payments", value: `R ${PAYMENTS.filter(p=>p.type==="MEDICAL_AID").reduce((s,p)=>s+p.amount,0).toLocaleString("en-ZA", {minimumFractionDigits:2})}`, sub: "From schemes", color: "text-primary" },
              { label: "Patient Payments", value: `R ${PAYMENTS.filter(p=>p.type!=="MEDICAL_AID").reduce((s,p)=>s+p.amount,0).toLocaleString("en-ZA", {minimumFractionDigits:2})}`, sub: "Cash/Card/EFT", color: "text-green-600" },
              { label: "Unallocated", value: `R ${totalUnallocated.toFixed(2)}`, sub: "Needs allocation", color: totalUnallocated > 0 ? "text-yellow-700" : "text-green-600" },
            ].map((s) => (
              <Card key={s.label} className="p-4">
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </Card>
            ))}
          </div>

          {/* Record payment button */}
          <div className="flex justify-end mb-4">
            <Button className="gap-2">
              <Plus size={15} />
              Record Payment
            </Button>
          </div>

          {/* Payment list */}
          <Card>
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border bg-muted/30">
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</div>
              <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">From</div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reference</div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</div>
              <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Status</div>
            </div>
            <div className="divide-y divide-border">
              {PAYMENTS.map((pay) => {
                const typeInfo = TYPE_LABELS[pay.type] ?? TYPE_LABELS.PATIENT_CASH
                return (
                  <div key={pay.id} className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    <div className="col-span-2">
                      <Badge variant="outline" className={cn("text-xs", typeInfo.cls)}>{typeInfo.label}</Badge>
                    </div>
                    <div className="col-span-3">
                      <p className="text-sm font-medium text-foreground">{pay.from}</p>
                      <p className="text-xs text-muted-foreground">{pay.invoices} invoice{pay.invoices !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-mono text-muted-foreground">{pay.ref}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-foreground">{pay.date}</p>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-sm font-semibold text-foreground">R {pay.amount.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          pay.status === "Allocated" ? "bg-green-50 text-green-700 border-green-200" :
                          pay.status === "Unallocated" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {pay.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}

      {tab === "reconcile" && (
        <div className="space-y-6">
          {/* Upload section */}
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Upload Remittance Advice</h3>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={() => setDragging(false)}
            >
              <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Drop your remittance advice file here</p>
              <p className="text-sm text-muted-foreground mt-1">Supports PDF, CSV, XLSX, EDIFACT</p>
              <Button variant="outline" className="mt-4 gap-2">
                <Upload size={14} />
                Browse Files
              </Button>
            </div>
          </Card>

          {/* Auto-matched items */}
          <Card>
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <CheckCircle size={16} className="text-green-600" />
              <h3 className="font-semibold text-foreground">Auto-Matched Items</h3>
              <Badge variant="secondary" className="ml-auto">3 matched</Badge>
            </div>
            {[
              { invoice: "INV-20260424-00012", patient: "Fatima Patel", claimed: 1200.00, paid: 1200.00, match: "Exact" },
              { invoice: "INV-20260423-00010", patient: "Robert Khumalo", claimed: 980.00, paid: 850.00, match: "Partial" },
              { invoice: "INV-20260422-00008", patient: "Ayanda Zulu", claimed: 650.00, paid: 650.00, match: "Exact" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold font-mono text-foreground">{item.invoice}</p>
                  <p className="text-xs text-muted-foreground">{item.patient}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Claimed: R {item.claimed.toFixed(2)}</p>
                  <p className="text-sm font-semibold text-foreground">Paid: R {item.paid.toFixed(2)}</p>
                </div>
                <Badge
                  variant="outline"
                  className={item.match === "Exact" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}
                >
                  {item.match} Match
                </Badge>
                <button className="text-xs text-muted-foreground hover:text-foreground underline">Review</button>
              </div>
            ))}
          </Card>

          {/* Unmatched */}
          <Card>
            <div className="flex items-center gap-2 p-5 border-b border-border">
              <AlertCircle size={16} className="text-yellow-600" />
              <h3 className="font-semibold text-foreground">Unmatched Items</h3>
              <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-700">1 unmatched</Badge>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Unknown reference: DISC-REF-9901</p>
                <p className="text-xs text-muted-foreground">Amount: R 340.00 — No matching invoice found</p>
              </div>
              <Button variant="outline" size="sm">Match Manually</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Ignore</Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "age-analysis" && (
        <div className="space-y-4">
          <Card>
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Debtors Age Analysis</h3>
              <p className="text-sm text-muted-foreground mt-0.5">As at 25 April 2026</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Debtor</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">30 days</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">60 days</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">90 days</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">120+ days</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {AGE_ANALYSIS.map((row, i) => {
                    const total = row.current + row.d30 + row.d60 + row.d90 + row.d120
                    return (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{row.name}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-foreground">{row.current > 0 ? `R ${row.current.toFixed(2)}` : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-yellow-600">{row.d30 > 0 ? `R ${row.d30.toFixed(2)}` : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-orange-600">{row.d60 > 0 ? `R ${row.d60.toFixed(2)}` : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-red-600">{row.d90 > 0 ? `R ${row.d90.toFixed(2)}` : "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-right text-red-700 font-semibold">{row.d120 > 0 ? `R ${row.d120.toFixed(2)}` : "—"}</td>
                        <td className="px-5 py-3.5 text-sm text-right font-bold text-foreground">R {total.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="px-5 py-3 text-sm font-bold text-foreground">TOTAL</td>
                    {[
                      AGE_ANALYSIS.reduce((s, r) => s + r.current, 0),
                      AGE_ANALYSIS.reduce((s, r) => s + r.d30, 0),
                      AGE_ANALYSIS.reduce((s, r) => s + r.d60, 0),
                      AGE_ANALYSIS.reduce((s, r) => s + r.d90, 0),
                      AGE_ANALYSIS.reduce((s, r) => s + r.d120, 0),
                    ].map((t, i) => (
                      <td key={i} className="px-4 py-3 text-sm font-bold text-right text-foreground">
                        {t > 0 ? `R ${t.toFixed(2)}` : "—"}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-sm font-bold text-right text-foreground">
                      R {AGE_ANALYSIS.reduce((s, r) => s + r.current + r.d30 + r.d60 + r.d90 + r.d120, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  )
}
