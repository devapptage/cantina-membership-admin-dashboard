/**
 * Notifications API Types
 */

export type NotificationTargetTier = "all" | "blanco" | "reposado" | "Añejo" | "secret"
export type NotificationType = "general" | "promotions" | "events" | "membership"

export interface Notification {
  id: string
  title: string
  body: string
  targetTier: NotificationTargetTier
  scheduledFor?: string
  type: NotificationType
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateNotificationData {
  title: string // required, min: 1, max: 100
  body: string // required, min: 1, max: 500
  targetTier?: NotificationTargetTier // optional, default: "all"
  scheduledFor?: string // optional, ISO date string
  type?: NotificationType // optional, default: "general"
}

export interface GetNotificationsParams {
  search?: string // optional, searches in title and body
  status?: "all" | "draft" | "scheduled" | "sent" | "sending" | "failed" // default: "all"
  targetTier?: "all" | "blanco" | "reposado" | "Añejo" | "secret" // optional
  page?: number // optional, default: 1, min: 1
  limit?: number // optional, default: 50, max: 100
}

export interface NotificationsResponse {
  success?: boolean
  data?: Notification[]
  notifications?: Notification[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

