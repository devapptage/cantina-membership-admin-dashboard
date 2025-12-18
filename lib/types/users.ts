/**
 * Users API Types
 */

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthday: string
  profileImage: string
  role: string
  membershipStatus: string
  membership: {
    startDate: string
    status: string
    tier: string
  } | null
  punchCard: {
    punches: number
    totalPunches: number
    rewardsClaimed: number
  }
  notificationSettings: {
    enabled: boolean
    promotions: boolean
    events: boolean
    membership: boolean
    general: boolean
  }
  pushTokens: Array<{
    token: string
    deviceId: string
    platform: string
    enabled: boolean
    createdAt: string
    lastUsed: string
  }>
  joinDate: string
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface UsersResponse {
  users: User[]
  pagination: Pagination
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  membershipStatus?: string
}

