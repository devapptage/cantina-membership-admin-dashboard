"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Mail, Key, Lock, CheckCircle, Loader2 } from "lucide-react"
import { authService } from "@/lib/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [devOTP, setDevOTP] = useState<string | undefined>(undefined)

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authService.forgotPassword(email)
      
      if (response.success) {
        setDevOTP(response.otp) // Only populated in dev mode
        setStep("otp")
      } else {
        setError(response.error || "Failed to send OTP. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authService.verifyOTP(email, otp)
      
      if (response.success && response.resetToken) {
        setResetToken(response.resetToken)
        setStep("password")
      } else {
        setError(response.error || "Invalid OTP. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate password
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.resetPassword(resetToken, password)
      
      if (response.success) {
        setStep("success")
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(response.error || "Failed to reset password. Please try again.")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => {
    const steps = [
      { id: "email", label: "Email", icon: Mail },
      { id: "otp", label: "Verify", icon: Key },
      { id: "password", label: "Reset", icon: Lock },
    ]

    const currentStepIndex = steps.findIndex(s => s.id === step)

    return (
      <div className="flex items-center justify-center mb-8 gap-2">
        {steps.map((s, index) => {
          const Icon = s.icon
          const isActive = s.id === step
          const isCompleted = index < currentStepIndex
          
          return (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : isCompleted
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${isCompleted ? "bg-accent" : "bg-muted"}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center px-4 pt-32">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-lg bg-accent mb-4 w-40">
            <Image src={"/bg.png"} alt="Logo" className="w-full h-full object-contain" width={20} height={20} />
          </div>
          <h1 className="text-3xl font-bold text-foreground bg-background">Reset Password</h1>
          <p className="text-muted-foreground mt-2 bg-background">
            {step === "email" && "Enter your email to receive an OTP"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "password" && "Create a new secure password"}
            {step === "success" && "Password reset successful!"}
          </p>
        </div>

        {/* Step Indicator */}
        {step !== "success" && renderStepIndicator()}

        {/* Forms */}
        <Card className="p-8 border border-border bg-card">
          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 h-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-foreground font-semibold">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isLoading}
                  maxLength={6}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent text-center text-2xl tracking-widest font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              {devOTP && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground mb-1">Development Mode:</p>
                  <p className="text-accent font-mono font-bold text-lg">OTP: {devOTP}</p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 h-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("email")
                    setOtp("")
                    setError("")
                  }}
                  className="w-full"
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-semibold">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 h-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-8 space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Password Reset Successful!</h2>
                <p className="text-muted-foreground">
                  Your password has been reset successfully. Redirecting to login...
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Back to Login */}
          {step !== "success" && (
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
