"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_INVOICES } from "@/lib/mock-data"
import { Plus, Search, Send, FileText, Download, ChevronRight } from "lucide-react"
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

const STATUS_FILTERS = ["All", "Draft", "Submitted", "Paid", "Rejected", "Partially Paid"]

export default function InvoicesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const filtered = MOCK_INVOICES.filter((inv) => {
    const q = search.toLowerCase()
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.patientName.toLowerCase().includes(q) ||
      inv.scheme.toLowerCase().includes(q)
    const matchStatus =
      statusFilter === "All" ||
      STATUS_STYLES[inv.status]?.label === statusFilter
    return matchSearch && matchStatus
  })

  const totalOutstanding = MOCK_INVOICES.reduce((sum, inv) => sum + inv.outstanding, 0)

  return (
    <AppShell title="Invoices" subtitle="Billing management">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Link href="/invoices/new">
          <Button className="gap-2">
            <Plus size={16} />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              statusFilter === f
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Invoices", value: MOCK_INVOICES.length.toString(), sub: "All time" },
          { label: "Outstanding", value: `R ${totalOutstanding.toFixed(2)}`, sub: "Total owed", color: "text-yellow-700" },
          { label: "Rejected", value: MOCK_INVOICES.filter(i => i.status === "REJECTED").length.toString(), sub: "Require action", color: "text-destructive" },
          { label: "Draft", value: MOCK_INVOICES.filter(i => i.status === "DRAFT").length.toString(), sub: "Unsent", color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className={cn("text-xl font-bold", s.color ?? "text-foreground")}>{s.value}</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Invoices table */}
      <Card>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border bg-muted/30">
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice</div>
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patient</div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Total</div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">O/S</div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Status</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((inv) => {
            const statusInfo = STATUS_STYLES[inv.status] ?? STATUS_STYLES.DRAFT
            return (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-3">
                  <p className="text-sm font-semibold font-mono text-foreground">{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">{inv.scheme}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-foreground">{inv.patientName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-foreground">{inv.dateOfService}</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="text-sm font-semibold text-foreground">R {inv.total.toFixed(2)}</p>
                </div>
                <div className="col-span-1 text-right">
                  {inv.outstanding > 0 ? (
                    <p className="text-sm font-medium text-yellow-700">R {inv.outstanding.toFixed(2)}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Badge className={cn("text-xs font-medium", statusInfo.cls)} variant="outline">
                    {statusInfo.label}
                  </Badge>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </Link>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p>No invoices found</p>
            </div>
          )}
        </div>
      </Card>
    </AppShell>
  )
}
