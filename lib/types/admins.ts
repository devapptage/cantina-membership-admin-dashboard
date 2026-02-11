/**
 * Admins API Types
 */

export interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
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

export interface AdminsResponse {
  admins: Admin[]
  pagination: Pagination
}

export interface GetAdminsParams {
  page?: number
  limit?: number
  search?: string
}
