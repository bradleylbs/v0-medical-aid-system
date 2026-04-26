"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  Building2,
  User,
  Settings,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Practice Details",    icon: Building2,   desc: "BHF practice number, name, address" },
  { id: 2, title: "First User",          icon: User,        desc: "Owner account and password" },
  { id: 3, title: "Switch Credentials", icon: Settings,    desc: "MediSwitch or Healthbridge config" },
  { id: 4, title: "Ready",              icon: CheckCircle, desc: "Confirm and launch" },
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1: Practice
  const [practiceName, setPracticeName] = useState("")
  const [practiceNumber, setPracticeNumber] = useState("")
  const [hpcsaNumber, setHpcsaNumber] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [practicePhone, setPracticePhone] = useState("")
  const [practiceEmail, setPracticeEmail] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")

  // Step 2: User
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Step 3: Switch
  const [switchProvider, setSwitchProvider] = useState<"MEDISWITCH" | "HEALTHBRIDGE">("MEDISWITCH")
  const [switchUsername, setSwitchUsername] = useState("")
  const [switchPassword, setSwitchPassword] = useState("")
  const [tariffPercentage, setTariffPercentage] = useState("100")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!practiceName) errs.practiceName = "Practice name is required"
      if (!practiceNumber) errs.practiceNumber = "BHF practice number is required"
      if (!hpcsaNumber) errs.hpcsaNumber = "HPCSA number is required"
      if (!practiceEmail) errs.practiceEmail = "Practice email is required"
    }
    if (s === 2) {
      if (!firstName) errs.firstName = "First name is required"
      if (!lastName) errs.lastName = "Last name is required"
      if (!userEmail) errs.userEmail = "Email is required"
      if (password.length < 8) errs.password = "Password must be at least 8 characters"
      if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match"
    }
    if (s === 3) {
      if (!switchUsername) errs.switchUsername = "Switch username is required"
      if (!switchPassword) errs.switchPassword = "Switch password is required"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validateStep(step)) return
    setStep(s => s + 1)
  }

  const back = () => setStep(s => s - 1)

  const handleFinish = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1500))
    router.push("/")
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
        <AlertCircle size={11} />{errors[field]}
      </p>
    ) : null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left sidebar: progress */}
      <div className="hidden lg:flex lg:w-72 bg-sidebar flex-col p-8">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">MediBill ZA</span>
        </div>

        <div>
          <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-4">
            Setup Wizard
          </p>
          <div className="space-y-1">
            {STEPS.map(s => {
              const Icon = s.icon
              const isComplete = step > s.id
              const isCurrent = step === s.id
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-start gap-3 px-3 py-3 rounded-lg transition-colors",
                    isCurrent ? "bg-sidebar-accent" : isComplete ? "" : "opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    isComplete ? "bg-green-500" : isCurrent ? "bg-primary" : "bg-sidebar-accent"
                  )}>
                    {isComplete ? (
                      <CheckCircle size={14} className="text-white" />
                    ) : (
                      <Icon size={13} className={isCurrent ? "text-white" : "text-sidebar-foreground/60"} />
                    )}
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isCurrent || isComplete ? "text-white" : "text-sidebar-foreground/60")}>
                      {s.title}
                    </p>
                    <p className="text-xs text-sidebar-foreground/50">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-sidebar-foreground/40">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-sidebar-foreground/70 hover:text-white underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">Step {step} of 4</Badge>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{STEPS[step - 1].title}</h2>
            <p className="text-muted-foreground text-sm mt-1">{STEPS[step - 1].desc}</p>
          </div>

          {/* Step 1: Practice Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground">Practice / Clinic Name <span className="text-destructive">*</span></label>
                  <Input value={practiceName} onChange={e => setPracticeName(e.target.value)} placeholder="Dr. Sipho Dlamini Inc." className="mt-1.5" />
                  <FieldError field="practiceName" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">BHF Practice Number <span className="text-destructive">*</span></label>
                  <Input value={practiceNumber} onChange={e => setPracticeNumber(e.target.value)} placeholder="0101234567" className="mt-1.5 font-mono" />
                  <FieldError field="practiceNumber" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">HPCSA Number <span className="text-destructive">*</span></label>
                  <Input value={hpcsaNumber} onChange={e => setHpcsaNumber(e.target.value)} placeholder="MP1234567" className="mt-1.5 font-mono" />
                  <FieldError field="hpcsaNumber" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">VAT Number</label>
                  <Input value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="4012345678 (optional)" className="mt-1.5 font-mono" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Practice Phone</label>
                  <Input value={practicePhone} onChange={e => setPracticePhone(e.target.value)} placeholder="011 234 5678" className="mt-1.5" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground">Practice Email <span className="text-destructive">*</span></label>
                  <Input type="email" value={practiceEmail} onChange={e => setPracticeEmail(e.target.value)} placeholder="billing@practice.co.za" className="mt-1.5" />
                  <FieldError field="practiceEmail" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">City</label>
                  <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Johannesburg" className="mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Province</label>
                  <select
                    value={province}
                    onChange={e => setProvince(e.target.value)}
                    className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select province</option>
                    {["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","North West","Northern Cape","Western Cape"].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: First user */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
                This account will have full Practice Owner access and can add additional users after setup.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">First Name <span className="text-destructive">*</span></label>
                  <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Sipho" className="mt-1.5" />
                  <FieldError field="firstName" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Last Name <span className="text-destructive">*</span></label>
                  <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dlamini" className="mt-1.5" />
                  <FieldError field="lastName" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-foreground">Email Address <span className="text-destructive">*</span></label>
                  <Input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="sipho@practice.co.za" className="mt-1.5" />
                  <FieldError field="userEmail" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Password <span className="text-destructive">*</span></label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" />
                  <FieldError field="password" />
                  <p className="text-xs text-muted-foreground mt-1">Min. 8 characters, uppercase + number required</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Confirm Password <span className="text-destructive">*</span></label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" />
                  <FieldError field="confirmPassword" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Switch credentials */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Provider selection */}
              <div>
                <label className="text-sm font-medium text-foreground">Switch Provider</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(["MEDISWITCH", "HEALTHBRIDGE"] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setSwitchProvider(p)}
                      className={cn(
                        "px-4 py-3 rounded-lg border text-sm font-medium text-left transition-colors",
                        switchProvider === p
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      )}
                    >
                      <p className="font-semibold">{p}</p>
                      <p className={cn("text-xs mt-0.5", switchProvider === p ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {p === "MEDISWITCH" ? "Most commonly used in SA" : "Alternative switch provider"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Switch Username <span className="text-destructive">*</span></label>
                  <Input value={switchUsername} onChange={e => setSwitchUsername(e.target.value)} placeholder="practice_user" className="mt-1.5 font-mono" />
                  <FieldError field="switchUsername" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Switch Password <span className="text-destructive">*</span></label>
                  <Input type="password" value={switchPassword} onChange={e => setSwitchPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" />
                  <FieldError field="switchPassword" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Tariff Percentage (% of NRPL)</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <Input
                    type="number"
                    min={100}
                    max={200}
                    value={tariffPercentage}
                    onChange={e => setTariffPercentage(e.target.value)}
                    className="w-32 font-mono"
                  />
                  <span className="text-sm text-muted-foreground">
                    {parseFloat(tariffPercentage) === 100
                      ? "Billing at 100% of NRPL (standard)"
                      : `Billing at ${tariffPercentage}% of NRPL`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Most medical aids will only pay up to 100% of NRPL. Patients are liable for any excess.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                Switch credentials are stored encrypted using AES-256. They are never logged or exposed in API responses.
                Contact MediSwitch (+27 12 427 9900) to obtain your credentials.
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Practice", value: practiceName || "—", icon: Building2 },
                  { label: "Practice Number", value: practiceNumber || "—", mono: true },
                  { label: "Owner Account", value: userEmail || "—" },
                  { label: "Switch Provider", value: switchProvider },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <span className={cn("text-sm font-medium text-foreground", (row as { mono?: boolean }).mono && "font-mono")}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary mb-6">
                All data will be stored securely in South Africa in compliance with POPIA and the Medical Schemes Act.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <div>
              {step > 1 ? (
                <Button variant="outline" onClick={back} className="gap-2">
                  <ChevronLeft size={15} /> Back
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" className="gap-1 text-muted-foreground">
                    <ChevronLeft size={15} /> Already have an account?
                  </Button>
                </Link>
              )}
            </div>
            <div>
              {step < 4 ? (
                <Button onClick={next} className="gap-2">
                  Next <ChevronRight size={15} />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={saving} className="gap-2">
                  <ShieldCheck size={15} />
                  {saving ? "Setting up practice..." : "Launch MediBill ZA"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
