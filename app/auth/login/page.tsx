"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type LoginStep = "credentials" | "mfa"

// Demo credentials
const DEMO_EMAIL = "admin@medibillza.co.za"
const DEMO_PASSWORD = "MediBill2026!"
const DEMO_MFA = "123456"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [attemptCount, setAttemptCount] = useState(0)

  const handleLogin = async () => {
    setError("")
    if (!email) { setError("Email address is required"); return }
    if (!password) { setError("Password is required"); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 900))

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setStep("mfa")
    } else {
      const next = attemptCount + 1
      setAttemptCount(next)
      if (next >= 5) {
        setError("Account temporarily locked after 5 failed attempts. Try again in 15 minutes.")
      } else {
        setError(`Invalid email or password. ${5 - next} attempt${5 - next === 1 ? "" : "s"} remaining.`)
      }
    }
    setLoading(false)
  }

  const handleMfa = async () => {
    setError("")
    if (mfaCode.length !== 6) { setError("Enter your 6-digit authentication code"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    if (mfaCode === DEMO_MFA) {
      router.push("/")
    } else {
      setError("Invalid authentication code. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MediBill ZA</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            South African Medical Aid Billing
          </h1>
          <p className="text-sidebar-foreground/70 text-lg leading-relaxed">
            Streamline your practice billing, submit claims electronically to all major medical aids, and reconcile payments — all from one platform.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { label: "EDIFACT claim submission via MediSwitch", desc: "Direct EDI routing to all 20 schemes" },
            { label: "Real-time benefit checks", desc: "Instant member validation before billing" },
            { label: "POPIA & Medical Schemes Act compliant", desc: "Data stored in South Africa only" },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mt-0.5 shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-sidebar-foreground/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">MediBill ZA</span>
          </div>

          {step === "credentials" ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
                <p className="text-muted-foreground mt-1">
                  Use your practice credentials to access the billing system.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Email address</label>
                  <div className="relative mt-1.5">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@practice.co.za"
                      className="pl-9"
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      autoComplete="email"
                      disabled={loading || attemptCount >= 5}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Password</label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pl-9 pr-10"
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      autoComplete="current-password"
                      disabled={loading || attemptCount >= 5}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleLogin}
                  disabled={loading || attemptCount >= 5}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </div>

              {/* Demo credentials hint */}
              <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Demo credentials</p>
                <div className="space-y-1 text-xs text-muted-foreground font-mono">
                  <p>Email: <span className="text-foreground">{DEMO_EMAIL}</span></p>
                  <p>Password: <span className="text-foreground">{DEMO_PASSWORD}</span></p>
                  <p>MFA code: <span className="text-foreground">{DEMO_MFA}</span></p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                New practice?{" "}
                <Link href="/auth/setup" className="text-primary hover:underline">
                  Set up your account
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck size={22} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Two-factor authentication</h2>
                <p className="text-muted-foreground mt-1">
                  Enter the 6-digit code from your authenticator app to complete sign-in.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-5">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Authentication Code</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="mt-1.5 text-center text-2xl font-mono tracking-widest h-14"
                    maxLength={6}
                    onKeyDown={e => e.key === "Enter" && handleMfa()}
                    autoFocus
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleMfa}
                  disabled={loading || mfaCode.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </Button>
              </div>

              <button
                onClick={() => { setStep("credentials"); setMfaCode(""); setError("") }}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground w-full text-center"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
