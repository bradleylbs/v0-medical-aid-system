import Link from "next/link"
import { UserPlus, FileText, Stethoscope, Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"

const actions = [
  { label: "New Patient", icon: UserPlus, href: "/patients/new", color: "text-primary bg-primary/10" },
  { label: "New Invoice", icon: FileText, href: "/invoices/new", color: "text-green-600 bg-green-100" },
  { label: "Check Benefits", icon: Stethoscope, href: "/patients?action=benefit-check", color: "text-purple-600 bg-purple-100" },
  { label: "New Appointment", icon: Calendar, href: "/appointments/new", color: "text-orange-600 bg-orange-100" },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link key={action.href} href={action.href}>
            <Card className="flex items-center gap-3 p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action.color}`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
