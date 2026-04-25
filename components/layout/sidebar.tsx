"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  ClipboardCheck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Building2,
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    label: "Claims",
    href: "/claims",
    icon: ClipboardCheck,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
]

const bottomItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-64 h-screen bg-sidebar text-sidebar-foreground fixed left-0 top-0 z-50 border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <Image
          src="/meddiary-logo.png"
          alt="Med Diary"
          width={120}
          height={50}
          className="object-contain"
        />
      </div>

      {/* Practice info */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 text-primary">
          <Building2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sidebar-foreground truncate">Dr. S. Dlamini</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">BHF: GP-0012345</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom items */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Version */}
      <div className="px-5 py-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/30 text-center">Med Diary v1.0 · Connecting Healthcare</p>
      </div>
    </aside>
  )
}
