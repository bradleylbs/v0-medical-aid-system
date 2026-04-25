import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FileText, CheckCircle, XCircle, CreditCard, UserPlus, Send } from "lucide-react"

const activities = [
  {
    id: "1",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
    title: "Claim accepted",
    desc: "INV-20260425-00012 · Discovery",
    time: "9 min ago",
  },
  {
    id: "2",
    icon: CreditCard,
    color: "text-primary bg-primary/10",
    title: "Payment received",
    desc: "R 1,250.00 · Bonitas RA",
    time: "22 min ago",
  },
  {
    id: "3",
    icon: XCircle,
    color: "text-destructive bg-red-100",
    title: "Claim rejected",
    desc: "INV-20260424-00009 · Code 05",
    time: "1 hr ago",
  },
  {
    id: "4",
    icon: FileText,
    color: "text-yellow-600 bg-yellow-100",
    title: "Invoice finalised",
    desc: "INV-20260425-00014 · R 850.00",
    time: "2 hr ago",
  },
  {
    id: "5",
    icon: UserPlus,
    color: "text-purple-600 bg-purple-100",
    title: "New patient registered",
    desc: "Maria Santos · Momentum",
    time: "3 hr ago",
  },
  {
    id: "6",
    icon: Send,
    color: "text-primary bg-primary/10",
    title: "Claim submitted",
    desc: "INV-20260425-00011 · GEMS",
    time: "3 hr ago",
  },
  {
    id: "7",
    icon: CheckCircle,
    color: "text-green-600 bg-green-100",
    title: "Claim accepted",
    desc: "INV-20260424-00008 · Bonitas",
    time: "5 hr ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-5 border-b border-border">
        <h2 className="font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="flex-1 divide-y divide-border overflow-y-auto max-h-80">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-start gap-3 px-5 py-3">
              <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0", activity.color)}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
