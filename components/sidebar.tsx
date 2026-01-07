"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, LayoutDashboard, Users, Package, Bell, Settings, LogOut, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { useAuth } from "./auth-context"
import Image from "next/image"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "User Management", href: "/users" },
  { icon: Package, label: "Merchandise", href: "/merchandise" },
  { icon: ShoppingCart, label: "Orders", href: "/orders" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  // { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar({ open, onToggle }: { open: boolean; onToggle: (open: boolean) => void }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const handleSignOut = () => {
    console.log("[v0] Sign out clicked")
    setShowSignOutConfirm(true)
  }

  const confirmSignOut = () => {
    console.log("[v0] Sign out confirmed")
    setShowSignOutConfirm(false)
    onToggle(false)
    logout()
  }

  return (
    <>
      <button
        onClick={() => onToggle(!open)}
        className="fixed top-4 left-4 z-50 md:hidden bg-card p-2 rounded-lg border border-border hover:bg-muted transition-colors shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => onToggle(false)}
        />
      )}

      <div
        className={`${open ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative w-64 md:w-64 bg-card border-r border-border transition-all duration-300 flex flex-col shadow-lg z-50 h-screen`}
      >
        <div className="px-4 md:px-6 py-6 md:py-8 border-b border-border/50">
        <div className="flex items-center gap-4">
  {/* Logo */}
  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0">
    <Image
      src="/bg.png"
      alt="Logo"
      width={200}
      height={200}
      className="w-full h-full object-cover"
      priority
    />
  </div>

  {/* Text */}
  <div className="min-w-0">
    <h1 className="text-base md:text-lg font-bold text-foreground leading-tight truncate">
      Cantina
    </h1>
    <p className="text-xs md:text-sm text-muted-foreground truncate">
      Admin Panel
    </p>
  </div>
</div></div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onToggle(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive ? "bg-primary text-primary-foreground shadow-md" : "text-foreground hover:bg-muted/50"
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "" : "group-hover:text-accent"}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all duration-200 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {showSignOutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-sm w-full p-6 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-xl font-bold">Sign Out?</h2>
              <p className="text-muted-foreground mt-2">You will be logged out of your admin account.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmSignOut}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
