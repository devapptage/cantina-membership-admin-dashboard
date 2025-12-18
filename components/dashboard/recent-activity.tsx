"use client"

import { UserPlus, ShoppingBag, Package, CreditCard } from "lucide-react"
import type { RecentActivityItem } from "@/lib/types/dashboard"

interface RecentActivityProps {
  activities?: RecentActivityItem[]
  isLoading?: boolean
}

function getActivityIcon(type: RecentActivityItem['type']) {
  switch (type) {
    case 'user_registered':
      return UserPlus
    case 'membership_purchased':
      return ShoppingBag
    case 'product_added':
      return Package
    case 'order_placed':
      return CreditCard
    default:
      return Package
  }
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : []
  
  console.log('[RecentActivity] Component rendered')
  console.log('[RecentActivity] Raw activities prop:', activities)
  console.log('[RecentActivity] Safe activities:', safeActivities)
  console.log('[RecentActivity] Activities is array:', Array.isArray(activities))
  console.log('[RecentActivity] Safe activities length:', safeActivities.length)
  console.log('[RecentActivity] isLoading:', isLoading)
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Recent Activity</h2>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {isLoading ? (
        <div className="space-y-0">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`p-4 md:p-6 flex items-start gap-4 ${
                  i !== 4 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-9 h-9 bg-muted rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-48 animate-pulse"></div>
                </div>
                <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : safeActivities.length > 0 ? (
          <div className="space-y-0">
            {safeActivities.map((activity, idx) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div
                  key={idx}
                  className={`p-4 md:p-6 flex items-start gap-4 ${
                    idx !== safeActivities.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
              </div>
            )
          })}
        </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  )
}
