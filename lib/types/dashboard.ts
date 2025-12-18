/**
 * Dashboard API Types
 */

export interface DashboardOverview {
  totalUsers: number
  activeMembers: number
  totalProducts: number
  merchandiseSales: number
  totalOrders: number
}

export interface RecentActivityItem {
  type: 'membership_purchased' | 'product_added' | 'user_registered' | 'order_placed'
  title: string
  description: string
  userEmail?: string
  productName?: string
  amount?: number
  timestamp: string
}

export interface QuickAction {
  title: string
  description: string
  route: string
  icon: string
}

export interface QuickActions {
  manageUsers: QuickAction
  merchandise: QuickAction
  notifications: QuickAction
}

export interface DashboardData {
  overview: DashboardOverview
  recentActivity: RecentActivityItem[]
  quickActions: QuickActions
}

export interface DashboardResponse {
  result: {
    data: DashboardData
  }
}

