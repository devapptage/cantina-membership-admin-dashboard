"use client"

import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react"
import type { DashboardOverview } from "@/lib/types/dashboard"

interface OverviewProps {
  overview?: DashboardOverview
  isLoading?: boolean
}

export function Overview({ overview, isLoading }: OverviewProps) {
  console.log('[Overview] Overview data:', overview)
  const stats = overview ? [
    {
      label: "Total Users",
      value: overview.totalUsers.toString(),
      icon: Users,
    },
    {
      label: "Active Members",
      value: overview.activeMembers.toString(),
      icon: Users,
    },
    {
      label: "Merchandise Sales",
      value: `$${overview.merchandiseSales.toFixed(2)}`,
      icon: ShoppingCart,
    },
    {
      label: "Products",
      value: overview.totalProducts.toString(),
      icon: Package,
    },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">Key metrics at a glance</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-lg p-6 animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-24 mb-4"></div>
              <div className="h-8 bg-muted rounded w-16 mb-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-card border border-border/50 rounded-lg p-6 hover:border-accent/50 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold mt-3">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-accent/10 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
