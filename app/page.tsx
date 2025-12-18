"use client"

import { useAuth } from "@/components/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { dashboardService } from "@/lib/api/dashboard"
import { useEffect, useState } from "react"
import type { DashboardData } from "@/lib/types/dashboard"

export default function Page() {
  const { isAuthenticated } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      console.log('[Dashboard Page] Starting to fetch dashboard data, isAuthenticated:', isAuthenticated)
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('[Dashboard Page] Calling dashboardService.getDashboard()')
        const response = await dashboardService.getDashboard()
        console.log('[Dashboard Page] Dashboard response received:', response)
        
        if (response.success && response.data) {
          console.log('[Dashboard Page] Dashboard data set successfully')
          console.log('[Dashboard Page] Full dashboard data:', JSON.stringify(response.data, null, 2))
          console.log('[Dashboard Page] Recent Activity:', response.data.recentActivity)
          console.log('[Dashboard Page] Recent Activity type:', typeof response.data.recentActivity)
          console.log('[Dashboard Page] Recent Activity is array:', Array.isArray(response.data.recentActivity))
          setDashboardData(response.data)
        } else {
          console.error('[Dashboard Page] Dashboard fetch failed:', response.error)
          setError(response.error || 'Failed to fetch dashboard data')
        }
      } catch (err) {
        console.error('[Dashboard Page] Dashboard fetch error:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchDashboard()
    } else {
      console.log('[Dashboard Page] Not authenticated, skipping dashboard fetch')
      setIsLoading(false)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-balance">Welcome Back</h1>
            <p className="text-muted-foreground mt-2 text-base">Here's your membership overview and key metrics</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Overview overview={dashboardData?.overview} isLoading={isLoading} />
        <RecentActivity activities={dashboardData?.recentActivity} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  )
}
