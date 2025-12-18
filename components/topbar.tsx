"use client"

import Link from "next/link"
import { Bell, User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function TopBar() {
  const router = useRouter()
  const [showLogoutMenu, setShowLogoutMenu] = useState(false)

  const handleLogout = () => {
    console.log("[v0] User logged out")
    setShowLogoutMenu(false)
    router.push("/")
  }

  return (
    <div className="bg-card border-b border-border px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground font-medium">Welcome back, Admin</div>
      </div>

      <div className="flex items-center gap-6">
        <Link
          href="/notifications"
          className="relative p-2 hover:bg-muted rounded-lg transition-all duration-200 group"
        >
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full"></span>
        </Link>

        <Link href="/settings" className="p-2 hover:bg-muted rounded-lg transition-all duration-200 group">
          <Settings className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            className="p-2 hover:bg-muted rounded-lg transition-all duration-200"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-accent-foreground" />
            </div>
          </button>

          {showLogoutMenu && (
            <div className="absolute right-0 mt-3 bg-card border border-border rounded-lg shadow-xl z-50 w-48 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground mt-1">admin@cantina.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-3 transition-colors text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
