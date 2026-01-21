"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authService } from "@/lib/api/auth"
import type { User } from "@/lib/types/auth"

interface AuthContextType {
  isAuthenticated: boolean
  adminUser: { email: string; role: string } | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [adminUser, setAdminUser] = useState<User | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken()
      const user = authService.getCurrentUser()

      // Define public routes that don't require authentication
      const publicRoutes = ["/login", "/privacy-policy"]
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route))

      if (token && user && !authService.isTokenExpired()) {
        setAdminUser(user)
        setIsAuthenticated(true)
      } else {
        if (authService.isTokenExpired()) {
          authService.logout()
        }
        setIsAuthenticated(false)
        setAdminUser(null)
        
        // Only redirect to login if not on a public route
        if (!isPublicRoute) {
          router.push("/login")
        }
      }
      
      setIsChecking(false)
    }

    checkAuth()
  }, [pathname, router])

  const logout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setAdminUser(null)
    router.push("/login")
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ isAuthenticated, adminUser, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
