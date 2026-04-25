import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: "default" | "warning" | "danger" | "success"
}

const variantStyles = {
  default: {
    icon: "bg-primary/10 text-primary",
    value: "text-foreground",
  },
  warning: {
    icon: "bg-yellow-100 text-yellow-600",
    value: "text-yellow-700",
  },
  danger: {
    icon: "bg-red-100 text-destructive",
    value: "text-destructive",
  },
  success: {
    icon: "bg-green-100 text-green-600",
    value: "text-green-700",
  },
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: MetricCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold mt-1", styles.value)}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-destructive")}>
              <span>{trend.value >= 0 ? "+" : ""}{trend.value}%</span>
              <span className="text-muted-foreground font-normal">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl", styles.icon)}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  )
}
