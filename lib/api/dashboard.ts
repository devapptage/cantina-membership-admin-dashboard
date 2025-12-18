/**
 * Dashboard API Service
 * Handles dashboard-related API calls
 */

import { apiClient } from './client'
import type { DashboardData } from '../types/dashboard'

class DashboardService {
  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<{ success: boolean; data?: DashboardData; error?: string; message?: string }> {
    try {
      console.log('[Dashboard Service] Fetching dashboard data')
      
      const response = await apiClient.get<DashboardData>('/api/trpc/admin.dashboard')
      
      console.log('[Dashboard Service] API Response:', response)
      console.log('[Dashboard Service] Response success:', response.success)
      console.log('[Dashboard Service] Response data:', response.data)
      console.log('[Dashboard Service] Response data type:', typeof response.data)
      if (response.data) {
        console.log('[Dashboard Service] Response data keys:', Object.keys(response.data))
        console.log('[Dashboard Service] Recent Activity in response:', response.data.recentActivity)
      }

      if (response.success && response.data) {
        // Ensure recentActivity is an array
        const dashboardData = {
          ...response.data,
          recentActivity: Array.isArray(response.data.recentActivity) 
            ? response.data.recentActivity 
            : []
        }
        console.log('[Dashboard Service] Processed dashboard data:', dashboardData)
        return {
          success: true,
          data: dashboardData,
          message: 'Dashboard data fetched successfully',
        }
      }

      const errorMsg = typeof response.error === 'string' 
        ? response.error 
        : 'Failed to fetch dashboard data'
      
      return {
        success: false,
        error: errorMsg,
        message: errorMsg,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      console.error('[Dashboard Service] Get dashboard error:', error)
      return {
        success: false,
        error: errorMessage,
        message: errorMessage,
      }
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService()

