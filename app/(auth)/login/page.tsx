"use client"

import type React from "react"
import { authService } from "@/lib/api/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })
      console.log("[Auth] Login response:", response)

      if (response.success) {
        console.log("[Auth] Login successful")
        router.push("/")
        router.refresh() // Refresh to update auth state
      } else {
        // Extract error message as string
        const errorMsg = typeof response.error === 'string'
          ? response.error
          : typeof response.error === 'object' && (response.error as any)?.message
            ? (response.error as any).message
            : typeof response.message === 'string'
              ? response.message
              : "Invalid email or password"

        setError(errorMsg)
        console.log("[Auth] Login failed:", errorMsg)
      }
    } catch (err) {
      console.error("[Auth] Login error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center px-4 pt-40" >
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-lg bg-accent mb-4 w-40">
            <Image src={"/bg.png"} alt="Logo" className="w-full h-full object-contain" width={20} height={20} />
          </div>
          <h1 className="text-3xl font-bold text-foreground bg-background">Cantina Admin</h1>
          <p className="text-muted-foreground mt-2  bg-background">Membership Management Dashboard</p>
        </div>

        {/* Login Card */}
        <Card className="p-8 border border-border bg-card">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-semibold">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">
                Password
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
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Demo Credentials Info */}
            {/* <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="space-y-1 font-mono text-xs">
                <p className="text-foreground">
                  Email: <span className="text-accent">admin@admin.com</span>
                </p>
                <p className="text-foreground">
                  Password: <span className="text-accent">admin1234</span>
                </p>
              </div>
            </div> */}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2 h-auto"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          {/* <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>This is a demo admin dashboard</p>
            <p>Use the credentials above to access</p>
          </div> */}
        </Card>
      </div>
    </div>
  )
}
