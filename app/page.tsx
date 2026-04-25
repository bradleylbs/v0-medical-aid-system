import { AppShell } from "@/components/layout/app-shell"
import { MetricCard } from "@/components/dashboard/metric-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TodaysAppointments } from "@/components/dashboard/todays-appointments"
import { ClaimsChart } from "@/components/dashboard/claims-chart"
import { QuickActions } from "@/components/dashboard/quick-actions"
import {
  FileText,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react"

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle={`Friday, 25 April 2026 · Dr. Sipho Dlamini GP Practice`}
    >
      {/* Quick actions */}
      <QuickActions />

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
        <MetricCard
          title="Today's Invoices"
          value="R 12,450.00"
          subtitle="14 invoices raised"
          icon={FileText}
          trend={{ value: 8, label: "vs yesterday" }}
          variant="default"
        />
        <MetricCard
          title="Outstanding Balance"
          value="R 84,230.00"
          subtitle="Across 47 patients"
          icon={Clock}
          trend={{ value: -3, label: "vs last month" }}
          variant="warning"
        />
        <MetricCard
          title="Pending Claims"
          value="23"
          subtitle="Awaiting scheme response"
          icon={AlertCircle}
          variant="default"
        />
        <MetricCard
          title="Rejected Claims"
          value="5"
          subtitle="Require action today"
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Today's appointments — takes 2/3 */}
        <div className="xl:col-span-2">
          <TodaysAppointments />
        </div>
        {/* Recent activity — takes 1/3 */}
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Claims chart */}
      <div className="mt-6">
        <ClaimsChart />
      </div>
    </AppShell>
  )
}
