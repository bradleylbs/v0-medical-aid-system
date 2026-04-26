"use client"

import { useState } from "react"
import Image from "next/image"
import { AppShell } from "@/components/layout/app-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Building2,
  User,
  Shield,
  Bell,
  CreditCard,
  Plug,
  Save,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Stethoscope,
  FileText,
} from "lucide-react"

// ── Setting tabs ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "practice", label: "Practice Profile", icon: Building2 },
  { id: "practitioner", label: "Practitioners", icon: User },
  { id: "billing", label: "Billing Defaults", icon: FileText },
  { id: "schemes", label: "Medical Aid Schemes", icon: Stethoscope },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "security", label: "Security", icon: Shield },
] as const

type Tab = typeof TABS[number]["id"]

// ── Connected scheme data ──────────────────────────────────────────────────────

const SCHEME_CONFIG = [
  { name: "Discovery Health", shortCode: "DISCOVERY", connected: true, realTime: true, lastSync: "2026-04-25 09:12" },
  { name: "GEMS", shortCode: "GEMS", connected: true, realTime: true, lastSync: "2026-04-25 10:02" },
  { name: "Bonitas", shortCode: "BONITAS", connected: true, realTime: false, lastSync: "2026-04-24 08:30" },
  { name: "Momentum Health", shortCode: "MOMENTUM", connected: false, realTime: false, lastSync: null },
  { name: "Medihelp", shortCode: "MEDIHELP", connected: false, realTime: false, lastSync: null },
  { name: "Fedhealth", shortCode: "FEDHEALTH", connected: false, realTime: false, lastSync: null },
  { name: "Bestmed", shortCode: "BESTMED", connected: false, realTime: false, lastSync: null },
]

const INTEGRATIONS = [
  {
    name: "HealthBridge",
    description: "Electronic claims switching to all major SA medical aids",
    status: "connected",
    plan: "Premium",
    icon: "HB",
  },
  {
    name: "PNET",
    description: "Practice management & electronic remittance advice",
    status: "connected",
    plan: "Standard",
    icon: "PN",
  },
  {
    name: "Mediswitch",
    description: "Online eligibility verification and real-time adjudication",
    status: "disconnected",
    plan: null,
    icon: "MS",
  },
  {
    name: "SnapScan / Yoco",
    description: "Point-of-sale patient payment processing",
    status: "disconnected",
    plan: null,
    icon: "SC",
  },
]

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("practice")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AppShell title="Settings" subtitle="Configure your practice, billing defaults, and integrations">
      <div className="flex gap-6">
        {/* Left nav */}
        <aside className="w-56 shrink-0">
          <Card className="p-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </Card>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── Practice Profile ──────────────────────────────── */}
          {activeTab === "practice" && (
            <>
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Image src="/meddiary-logo.png" alt="Med Diary" width={48} height={48} className="object-contain" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Practice Information</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">This information appears on invoices and claims submitted to medical aids.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Practice Name", value: "Dr. Sipho Dlamini GP Practice", full: true },
                    { label: "BHF Practice Number", value: "GP-0012345" },
                    { label: "PCNS Practice Number", value: "0012345" },
                    { label: "VAT Number (if registered)", value: "4560000000" },
                    { label: "Street Address", value: "12 Medical Park Drive, Sandton", full: true },
                    { label: "City", value: "Johannesburg" },
                    { label: "Province", value: "Gauteng" },
                    { label: "Postal Code", value: "2196" },
                    { label: "Practice Phone", value: "011 234 5678" },
                    { label: "Practice Email", value: "reception@drsiphogp.co.za" },
                    { label: "Banking Bank", value: "First National Bank" },
                    { label: "Account Number", value: "●●●● ●●●● 7890" },
                  ].map((field) => (
                    <div key={field.label} className={field.full ? "md:col-span-2" : ""}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
                      <Input defaultValue={field.value} className="text-sm" />
                    </div>
                  ))}
                </div>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </>
          )}

          {/* ── Practitioners ─────────────────────────────────── */}
          {activeTab === "practitioner" && (
            <Card>
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Practitioners</h2>
                <Button size="sm" className="gap-2">
                  <User size={14} />
                  Add Practitioner
                </Button>
              </div>
              {[
                { name: "Dr. Sipho Dlamini", role: "GP / Practice Owner", hpcsa: "MP0123456", bhf: "GP-0012345", active: true },
                { name: "Sr. Nomsa Khumalo", role: "Practice Nurse", hpcsa: "NP0234567", bhf: "—", active: true },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm shrink-0">
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role} · HPCSA: {p.hpcsa} · BHF: {p.bhf}</p>
                  </div>
                  <Badge variant="outline" className={p.active ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground"}>
                    {p.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Edit <ChevronRight size={12} />
                  </Button>
                </div>
              ))}
            </Card>
          )}

          {/* ── Billing Defaults ──────────────────────────────── */}
          {activeTab === "billing" && (
            <>
              <Card className="p-6">
                <h2 className="font-semibold text-foreground mb-4">Billing Defaults</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Default Billing Rate", value: "100% of Medical Aid Rate (NRPL)" },
                    { label: "Invoice Number Prefix", value: "INV" },
                    { label: "Invoice Payment Terms (days)", value: "30" },
                    { label: "Default ICD-10 Code", value: "Z00.0 (General exam)" },
                    { label: "Late Payment Interest Rate (%)", value: "2" },
                    { label: "Auto-submit claims to switch", value: "Yes" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{f.label}</label>
                      <Input defaultValue={f.value} className="text-sm" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Invoice Footer Text</h3>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                    defaultValue="Thank you for choosing Dr. Sipho Dlamini GP Practice. Please contact us on 011 234 5678 for any billing queries. EFT payments: FNB Acc: ●●●● ●●●● 7890 Branch: 250655 Ref: [Invoice Number]"
                  />
                </div>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                  {saved ? "Saved!" : "Save Changes"}
                </Button>
              </div>
            </>
          )}

          {/* ── Medical Aid Schemes ───────────────────────────── */}
          {activeTab === "schemes" && (
            <Card>
              <div className="p-5 border-b border-border">
                <h2 className="font-semibold text-foreground">Contracted Medical Aid Schemes</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Configure your switch credentials and real-time adjudication per scheme.</p>
              </div>
              <div className="divide-y divide-border">
                {SCHEME_CONFIG.map((scheme) => (
                  <div key={scheme.shortCode} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {scheme.shortCode.slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{scheme.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {scheme.connected
                          ? `Last sync: ${scheme.lastSync} · ${scheme.realTime ? "Real-time adjudication" : "Batch submission"}`
                          : "Not connected"}
                      </p>
                    </div>
                    {scheme.connected ? (
                      <div className="flex items-center gap-2">
                        {scheme.realTime && (
                          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">Real-time</Badge>
                        )}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs flex items-center gap-1">
                          <CheckCircle size={10} /> Connected
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-xs">Configure</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        <Plug size={12} /> Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Notifications ─────────────────────────────────── */}
          {activeTab === "notifications" && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-5">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  { label: "Claim Rejected", description: "Alert when a medical aid rejects a claim", email: true, sms: false, inApp: true },
                  { label: "Payment Received", description: "Notify when a payment is allocated to an invoice", email: true, sms: false, inApp: true },
                  { label: "Outstanding > 30 days", description: "Weekly digest of aged debtors", email: true, sms: false, inApp: false },
                  { label: "Benefits Check Result", description: "Notify when eligibility verification completes", email: false, sms: false, inApp: true },
                  { label: "Appointment Reminder", description: "Remind patient 24 hours before appointment", email: true, sms: true, inApp: false },
                  { label: "Low Benefit Warning", description: "Alert when patient savings/day limit is nearly exhausted", email: false, sms: false, inApp: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-start justify-between gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      {(["email", "sms", "inApp"] as const).map((ch) => (
                        <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={n[ch]}
                            className="rounded border-border accent-primary"
                          />
                          <span className="capitalize">{ch === "inApp" ? "In-App" : ch.toUpperCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <CheckCircle size={15} /> : <Save size={15} />}
                  {saved ? "Saved!" : "Save Preferences"}
                </Button>
              </div>
            </Card>
          )}

          {/* ── Integrations ──────────────────────────────────── */}
          {activeTab === "integrations" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <AlertCircle size={16} className="text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  Integrations are managed through your switch provider (HealthBridge or PNET). Contact your switch account manager to add or modify connected services.
                </p>
              </div>
              {INTEGRATIONS.map((intg) => (
                <Card key={intg.name} className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {intg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{intg.name}</p>
                      {intg.plan && (
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{intg.plan}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{intg.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        intg.status === "connected"
                          ? "bg-green-50 text-green-700 border-green-200 text-xs flex items-center gap-1"
                          : "bg-muted text-muted-foreground text-xs"
                      }
                    >
                      {intg.status === "connected" && <CheckCircle size={10} />}
                      {intg.status === "connected" ? "Connected" : "Not Connected"}
                    </Badge>
                    <Button variant="outline" size="sm" className="text-xs">
                      {intg.status === "connected" ? "Manage" : "Connect"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* ── Security ──────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="font-semibold text-foreground mb-4">Change Password</h2>
                <div className="space-y-3 max-w-md">
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
                      <Input type="password" placeholder="••••••••" className="text-sm" />
                    </div>
                  ))}
                  <Button className="gap-2 mt-2">
                    <Shield size={14} />
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-semibold text-foreground mb-1">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mb-4">Add an extra layer of security using an authenticator app.</p>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                    <AlertCircle size={11} /> Not Enabled
                  </Badge>
                  <Button variant="outline" size="sm">Enable 2FA</Button>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-semibold text-foreground mb-1">Session Management</h2>
                <p className="text-sm text-muted-foreground mb-4">Active sessions on your account.</p>
                {[
                  { device: "Chrome on Windows", location: "Sandton, GP", time: "Current session", current: true },
                  { device: "Safari on iPhone", location: "Johannesburg, GP", time: "2 hours ago", current: false },
                ].map((s) => (
                  <div key={s.device} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.device}</p>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                    </div>
                    {s.current ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">Current</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive">Revoke</Button>
                    )}
                  </div>
                ))}
              </Card>

              <Card className="p-6 border-red-200">
                <h2 className="font-semibold text-destructive mb-1">POPIA Compliance</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  All patient data is stored in compliance with the Protection of Personal Information Act (POPIA). Data is encrypted at rest and in transit.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Download Data Export</Button>
                  <Button variant="outline" size="sm" className="text-destructive border-red-200 hover:bg-red-50">Request Data Deletion</Button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
