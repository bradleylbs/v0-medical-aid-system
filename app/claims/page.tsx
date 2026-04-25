"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MOCK_CLAIMS, REJECTION_CODES } from "@/lib/mock-data"
import { ClipboardCheck, Search, Send, AlertCircle, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, { label: string; cls: string; icon: any }> = {
  PENDING:            { label: "Pending",           cls: "bg-muted text-muted-foreground",    icon: Clock },
  SUBMITTED:          { label: "Submitted",          cls: "bg-blue-100 text-blue-700",        icon: Send },
  ACCEPTED:           { label: "Accepted",           cls: "bg-green-100 text-green-700",      icon: CheckCircle },
  PARTIALLY_ACCEPTED: { label: "Partially Accepted", cls: "bg-yellow-100 text-yellow-700",    icon: AlertCircle },
  REJECTED:           { label: "Rejected",           cls: "bg-red-100 text-red-600",          icon: XCircle },
  RESUBMITTED:        { label: "Resubmitted",        cls: "bg-purple-100 text-purple-700",    icon: Send },
  CANCELLED:          { label: "Cancelled",          cls: "bg-muted text-muted-foreground",   icon: XCircle },
}

const STATUS_FILTERS = ["All", "Submitted", "Accepted", "Rejected", "Pending"]

export default function ClaimsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const filtered = MOCK_CLAIMS.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch =
      c.invoiceNumber.toLowerCase().includes(q) ||
      c.patientName.toLowerCase().includes(q) ||
      c.scheme.toLowerCase().includes(q)
    const matchStatus =
      statusFilter === "All" ||
      STATUS_STYLES[c.status]?.label === statusFilter
    return matchSearch && matchStatus
  })

  const pending = MOCK_CLAIMS.filter(c => c.status === "SUBMITTED").length
  const rejected = MOCK_CLAIMS.filter(c => c.status === "REJECTED").length
  const accepted = MOCK_CLAIMS.filter(c => c.status === "ACCEPTED").length

  return (
    <AppShell title="Claims Management" subtitle="Track and manage medical aid claims">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search claims, patients..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/invoices/new">
          <Button className="gap-2">
            <ClipboardCheck size={16} />
            New Claim
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
          { label: "Total Claims", value: MOCK_CLAIMS.length.toString(), sub: "All time", icon: ClipboardCheck },
          { label: "Accepted", value: accepted.toString(), sub: "Approved", icon: CheckCircle, color: "text-green-600" },
          { label: "Pending Response", value: pending.toString(), sub: "Awaiting scheme", icon: Clock, color: "text-blue-600" },
          { label: "Rejected", value: rejected.toString(), sub: "Require action", icon: XCircle, color: "text-destructive" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-4 flex items-start gap-3">
              <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg", s.color === "text-green-600" ? "bg-green-100" : s.color === "text-blue-600" ? "bg-blue-100" : s.color === "text-destructive" ? "bg-red-100" : "bg-primary/10")}>
                <Icon size={18} className={s.color ?? "text-primary"} />
              </div>
              <div>
                <p className={cn("text-xl font-bold", s.color ?? "text-foreground")}>{s.value}</p>
                <p className="text-sm font-medium text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Claims list */}
      <Card>
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-border bg-muted/30">
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Invoice</div>
          <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patient</div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scheme</div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted</div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Status</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((claim) => {
            const statusInfo = STATUS_STYLES[claim.status] ?? STATUS_STYLES.PENDING
            const StatusIcon = statusInfo.icon
            return (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="grid grid-cols-12 gap-2 items-center px-5 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-2">
                  <p className="text-sm font-semibold font-mono text-foreground">{claim.invoiceNumber}</p>
                  {claim.switchRef && <p className="text-xs text-muted-foreground truncate">{claim.switchRef}</p>}
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-foreground">{claim.patientName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-foreground">{claim.scheme}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-foreground">{claim.submittedAt}</p>
                </div>
                <div className="col-span-1 text-right">
                  <p className="text-sm font-semibold text-foreground">R {claim.amount.toFixed(2)}</p>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Badge className={cn("text-xs font-medium flex items-center gap-1", statusInfo.cls)} variant="outline">
                    <StatusIcon size={11} />
                    {statusInfo.label}
                  </Badge>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </Link>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p>No claims found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Rejected claims section (if any) */}
      {rejected > 0 && statusFilter === "All" && (
        <Card className="mt-6 border-red-200 bg-red-50/50">
          <div className="flex items-start gap-3 p-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 shrink-0">
              <AlertCircle size={18} className="text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Rejected Claims Require Action</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You have {rejected} rejected claim{rejected !== 1 ? "s" : ""} that require attention. Review rejection reasons and resubmit.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setStatusFilter("Rejected")}
              >
                View Rejected Claims
              </Button>
            </div>
          </div>
        </Card>
      )}
    </AppShell>
  )
}
