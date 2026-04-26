"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, TrendingDown, FileText, BarChart3, PieChart as PieIcon, Calendar } from "lucide-react"

// ── Mock data ──────────────────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "Nov", billed: 68400, collected: 61200, outstanding: 7200 },
  { month: "Dec", billed: 54200, collected: 49800, outstanding: 4400 },
  { month: "Jan", billed: 72100, collected: 65300, outstanding: 6800 },
  { month: "Feb", billed: 69800, collected: 63500, outstanding: 6300 },
  { month: "Mar", billed: 81200, collected: 74600, outstanding: 6600 },
  { month: "Apr", billed: 84230, collected: 71480, outstanding: 12750 },
]

const CLAIM_STATUS_TREND = [
  { month: "Nov", submitted: 42, accepted: 38, rejected: 4 },
  { month: "Dec", submitted: 31, accepted: 28, rejected: 3 },
  { month: "Jan", submitted: 48, accepted: 43, rejected: 5 },
  { month: "Feb", submitted: 44, accepted: 40, rejected: 4 },
  { month: "Mar", submitted: 56, accepted: 50, rejected: 6 },
  { month: "Apr", submitted: 23, accepted: 18, rejected: 5 },
]

const SCHEME_BREAKDOWN = [
  { name: "Discovery Health", value: 34200, count: 18 },
  { name: "GEMS", value: 21800, count: 12 },
  { name: "Bonitas", value: 14600, count: 9 },
  { name: "Momentum Health", value: 7200, count: 5 },
  { name: "Medihelp", value: 4100, count: 3 },
  { name: "Cash Patients", value: 2330, count: 4 },
]

const REJECTION_BREAKDOWN = [
  { code: "05", reason: "Prior auth not obtained", count: 8 },
  { code: "02", reason: "Membership not active", count: 5 },
  { code: "03", reason: "Code not covered by plan", count: 4 },
  { code: "23", reason: "Savings insufficient", count: 3 },
  { code: "09", reason: "Invalid ICD-10", count: 2 },
]

const TARIFF_USAGE = [
  { code: "0190", description: "New patient consult", count: 54, revenue: 26190 },
  { code: "0191", description: "Repeat consult", count: 89, revenue: 32485 },
  { code: "0192", description: "Extended new consult", count: 12, revenue: 7440 },
  { code: "0185", description: "Injection", count: 23, revenue: 3335 },
  { code: "4081", description: "ECG", count: 9, revenue: 3420 },
]

const PIE_COLORS = ["#1a7fe8", "#1565c0", "#42a5f5", "#90caf9", "#bbdefb", "#e3f2fd"]

const REPORT_TYPES = ["Revenue", "Claims", "Schemes", "Rejections", "Tariffs"] as const
type ReportType = typeof REPORT_TYPES[number]

const PERIOD_OPTIONS = ["This Month", "Last Month", "Last 3 Months", "Last 6 Months", "This Year"]

// ── Formatters ─────────────────────────────────────────────────────────────────

function formatRand(value: number) {
  return `R ${value.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("Revenue")
  const [period, setPeriod] = useState("Last 6 Months")

  const totalBilled = MONTHLY_REVENUE.reduce((s, r) => s + r.billed, 0)
  const totalCollected = MONTHLY_REVENUE.reduce((s, r) => s + r.collected, 0)
  const collectionRate = ((totalCollected / totalBilled) * 100).toFixed(1)
  const totalRejected = CLAIM_STATUS_TREND.reduce((s, r) => s + r.rejected, 0)
  const totalSubmitted = CLAIM_STATUS_TREND.reduce((s, r) => s + r.submitted, 0)
  const rejectionRate = ((totalRejected / totalSubmitted) * 100).toFixed(1)

  return (
    <AppShell title="Reports & Analytics" subtitle="Practice performance and financial reporting">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {REPORT_TYPES.map((r) => (
            <button
              key={r}
              onClick={() => setActiveReport(r)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeReport === r
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 px-3 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={14} />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: "Total Billed",
            value: formatRand(totalBilled),
            sub: "Last 6 months",
            trend: +8,
            icon: FileText,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Total Collected",
            value: formatRand(totalCollected),
            sub: "Cash received",
            trend: +5,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            label: "Collection Rate",
            value: `${collectionRate}%`,
            sub: "Industry avg: 85%",
            trend: +2,
            icon: BarChart3,
            color: parseFloat(collectionRate) >= 85 ? "text-green-600" : "text-yellow-600",
            bg: parseFloat(collectionRate) >= 85 ? "bg-green-100" : "bg-yellow-100",
          },
          {
            label: "Rejection Rate",
            value: `${rejectionRate}%`,
            sub: "Target: < 5%",
            trend: -1,
            icon: TrendingDown,
            color: parseFloat(rejectionRate) <= 5 ? "text-green-600" : "text-destructive",
            bg: parseFloat(rejectionRate) <= 5 ? "bg-green-100" : "bg-red-100",
          },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="p-4 flex items-start gap-3">
              <div className={cn("flex items-center justify-center w-10 h-10 rounded-lg shrink-0", kpi.bg)}>
                <Icon size={18} className={kpi.color} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xl font-bold truncate", kpi.color)}>{kpi.value}</p>
                <p className="text-sm font-medium text-foreground">{kpi.label}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={cn("text-xs font-medium", kpi.trend > 0 ? "text-green-600" : "text-destructive")}>
                    {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
                  </span>
                  <span className="text-xs text-muted-foreground">{kpi.sub}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Chart area */}
      {activeReport === "Revenue" && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-foreground">Revenue — Billed vs Collected</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly comparison over the last 6 months</p>
              </div>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                <Calendar size={11} className="mr-1" />
                Nov 2025 – Apr 2026
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={MONTHLY_REVENUE} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `R ${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: number) => [formatRand(value), ""]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="billed" name="Billed" fill="#90caf9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#1a7fe8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" name="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Monthly Collection Rate</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MONTHLY_REVENUE.map(r => ({ month: r.month, rate: +((r.collected / r.billed) * 100).toFixed(1) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Collection Rate"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Line type="monotone" dataKey="rate" stroke="#1a7fe8" strokeWidth={2} dot={{ fill: "#1a7fe8", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Outstanding by Month</h3>
              <div className="space-y-3">
                {MONTHLY_REVENUE.slice().reverse().map((r) => (
                  <div key={r.month} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-8">{r.month}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(r.collected / r.billed) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-16 text-right">{formatRand(r.outstanding)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeReport === "Claims" && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-5">
              <h3 className="font-semibold text-foreground">Claims Trend — Submitted vs Accepted vs Rejected</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly claim volumes</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={CLAIM_STATUS_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#90caf9" strokeWidth={2} dot={{ r: 4, fill: "#90caf9" }} />
                <Line type="monotone" dataKey="accepted" name="Accepted" stroke="#1a7fe8" strokeWidth={2} dot={{ r: 4, fill: "#1a7fe8" }} />
                <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly claim table */}
          <Card>
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Monthly Claim Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Month</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Submitted</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accepted</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rejected</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Success %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {CLAIM_STATUS_TREND.slice().reverse().map((row) => {
                    const rate = ((row.accepted / row.submitted) * 100).toFixed(0)
                    return (
                      <tr key={row.month} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{row.month} 2025/26</td>
                        <td className="px-4 py-3 text-sm text-right text-foreground">{row.submitted}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{row.accepted}</td>
                        <td className="px-4 py-3 text-sm text-right text-destructive font-medium">{row.rejected}</td>
                        <td className="px-5 py-3 text-sm text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              parseInt(rate) >= 90 ? "bg-green-50 text-green-700 border-green-200" :
                              parseInt(rate) >= 80 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              "bg-red-50 text-red-700 border-red-200"
                            )}
                          >
                            {rate}%
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeReport === "Schemes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Revenue by Medical Aid Scheme</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={SCHEME_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {SCHEME_BREAKDOWN.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatRand(v), "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Scheme Detail Breakdown</h3>
            </div>
            <div className="divide-y divide-border">
              {SCHEME_BREAKDOWN.map((scheme, i) => {
                const total = SCHEME_BREAKDOWN.reduce((s, r) => s + r.value, 0)
                const pct = ((scheme.value / total) * 100).toFixed(1)
                return (
                  <div key={scheme.name} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{scheme.name}</p>
                      <p className="text-xs text-muted-foreground">{scheme.count} invoices · {pct}% of revenue</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{formatRand(scheme.value)}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {activeReport === "Rejections" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Rejection Reasons</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={REJECTION_BREAKDOWN} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="code" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    formatter={(v: number) => [v, "Claims"]}
                    labelFormatter={(l) => `Code ${l}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)" }}
                  />
                  <Bar dataKey="count" name="Count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">Rejection Code Reference</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Top reasons affecting your practice</p>
              </div>
              <div className="divide-y divide-border">
                {REJECTION_BREAKDOWN.map((r) => (
                  <div key={r.code} className="flex items-start gap-3 px-5 py-3.5">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs font-mono shrink-0">
                      {r.code}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{r.reason}</p>
                    </div>
                    <p className="text-sm font-bold text-destructive shrink-0">{r.count}</p>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-border bg-red-50/40">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Most rejections are preventable. Ensure prior authorisation is obtained for procedures (Code 05) and verify patient membership before billing (Code 02).
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeReport === "Tariffs" && (
        <Card>
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Top Tariff Codes Used</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Based on invoices raised this period</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download size={13} />
              Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Count</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TARIFF_USAGE.sort((a, b) => b.revenue - a.revenue).map((t, i) => (
                  <tr key={t.code} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                        <Badge variant="outline" className="text-xs font-mono bg-primary/5 text-primary border-primary/20">{t.code}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-foreground">{t.description}</td>
                    <td className="px-4 py-3.5 text-sm text-right font-medium text-foreground">{t.count}</td>
                    <td className="px-5 py-3.5 text-sm text-right font-bold text-foreground">{formatRand(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={2} className="px-5 py-3 text-sm font-bold text-foreground">TOTAL</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-foreground">
                    {TARIFF_USAGE.reduce((s, t) => s + t.count, 0)}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-right text-foreground">
                    {formatRand(TARIFF_USAGE.reduce((s, t) => s + t.revenue, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </AppShell>
  )
}
