"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, ArrowLeft, CheckCircle, Mail, ShieldCheck } from "lucide-react"

type Step = "email" | "otp" | "reset" | "done"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailSubmit = async () => {
    setError("")
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address")
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setStep("otp")
  }

  const handleOtpSubmit = async () => {
    setError("")
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    // Demo OTP: 654321
    if (otp === "654321") {
      setStep("reset")
    } else {
      setError("Invalid OTP. Please check your email and try again.")
    }
    setLoading(false)
  }

  const handleReset = async () => {
    setError("")
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter and one number")
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setLoading(false)
    setStep("done")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">MediBill ZA</span>
        </div>

        {step === "email" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">Reset your password</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your account email and we will send you a one-time code.
            </p>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                <AlertCircle size={14} />{error}
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
                    onKeyDown={e => e.key === "Enter" && handleEmailSubmit()}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleEmailSubmit} disabled={loading}>
                {loading ? "Sending code..." : "Send Reset Code"}
              </Button>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
              Demo OTP: <span className="font-mono font-semibold text-foreground">654321</span>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">Check your email</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>. Enter it below.
            </p>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                <AlertCircle size={14} />{error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">One-time code</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="mt-1.5 text-center text-2xl font-mono tracking-widest h-14"
                  maxLength={6}
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleOtpSubmit()}
                />
              </div>
              <Button className="w-full" onClick={handleOtpSubmit} disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                onClick={() => { setStep("email"); setOtp(""); setError("") }}
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center flex items-center justify-center gap-1"
              >
                <ArrowLeft size={13} /> Use a different email
              </button>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-1">Set a new password</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Choose a strong password with at least 8 characters, one uppercase letter, and one number.
            </p>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                <AlertCircle size={14} />{error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">New password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Confirm new password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="mt-1.5"
                  onKeyDown={e => e.key === "Enter" && handleReset()}
                />
              </div>
              <Button className="w-full" onClick={handleReset} disabled={loading}>
                {loading ? "Saving password..." : "Reset Password"}
              </Button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Password updated</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link href="/auth/login">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        )}

        {step !== "done" && (
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft size={13} /> Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
