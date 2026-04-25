"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const data = [
  { month: "Nov", submitted: 64, accepted: 58, rejected: 6 },
  { month: "Dec", submitted: 71, accepted: 62, rejected: 9 },
  { month: "Jan", submitted: 80, accepted: 74, rejected: 6 },
  { month: "Feb", submitted: 88, accepted: 80, rejected: 8 },
  { month: "Mar", submitted: 95, accepted: 87, rejected: 8 },
  { month: "Apr", submitted: 78, accepted: 73, rejected: 5 },
]

const schemeBreakdown = [
  { scheme: "Discovery", rate: 96 },
  { scheme: "GEMS", rate: 94 },
  { scheme: "Bonitas", rate: 91 },
  { scheme: "Momentum", rate: 88 },
  { scheme: "Medihelp", rate: 87 },
  { scheme: "Fedhealth", rate: 85 },
]

export function ClaimsChart() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Bar chart */}
      <Card className="xl:col-span-2 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-foreground">Claims Overview</h2>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" />
              <span className="text-muted-foreground">Submitted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span className="text-muted-foreground">Accepted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
              <span className="text-muted-foreground">Rejected</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Bar dataKey="submitted" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="accepted" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Acceptance rates by scheme */}
      <Card className="p-5">
        <div className="mb-5">
          <h2 className="font-semibold text-foreground">Acceptance Rate by Scheme</h2>
          <p className="text-xs text-muted-foreground">Current month</p>
        </div>
        <div className="space-y-4">
          {schemeBreakdown.map((s) => (
            <div key={s.scheme}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{s.scheme}</span>
                <span className="text-sm font-semibold text-foreground">{s.rate}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${s.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
