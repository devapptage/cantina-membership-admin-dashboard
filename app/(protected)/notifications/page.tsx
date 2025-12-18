"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Send, X, Loader2 } from "lucide-react"
import { notificationsService } from "@/lib/api/notifications"
import type { Notification, CreateNotificationData } from "@/lib/types/notifications"

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [formData, setFormData] = useState<CreateNotificationData & { scheduledDate?: string; scheduledTime?: string }>({ 
    title: "", 
    body: "", 
    targetTier: "all", 
    type: "general",
    scheduledDate: "",
    scheduledTime: ""
  })
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const statuses = ["All", "Sent", "Draft", "Scheduled"]

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Map status filter to API format
        const apiStatus = statusFilter === "All" ? "all" : statusFilter.toLowerCase()
        
        const response = await notificationsService.getAllNotifications({
          search: searchTerm || undefined,
          status: apiStatus as any,
          page: 1,
          limit: 100,
        })
        
        if (response.success && response.data) {
          // Handle nested response structure: data.data contains the array
          let notificationsList: Notification[] = []
          if (Array.isArray(response.data)) {
            notificationsList = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            notificationsList = response.data.data
          } else if (response.data.notifications && Array.isArray(response.data.notifications)) {
            notificationsList = response.data.notifications
          }
          setNotifications(notificationsList)
        } else {
          setError(response.error || 'Failed to fetch notifications')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [statusFilter, searchTerm])

  // API handles filtering, so we just use the notifications directly
  const filteredNotifications = notifications

  const getStatusColor = (status?: string) => {
    const notifStatus = status || "Sent"
    switch (notifStatus) {
      case "Sent":
        return "bg-accent/10 text-accent"
      case "Scheduled":
        return "bg-blue-500/10 text-blue-400"
      case "Draft":
        return "bg-amber-500/10 text-amber-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTargetTier = (tier: string) => {
    const tierMap: Record<string, string> = {
      'all': 'All Members',
      'blanco': 'Blanco Members',
      'reposado': 'Reposado Members',
      'Añejo': 'Añejo Members',
      'anejo': 'Añejo Members',
      'secret': 'Secret Members'
    }
    return tierMap[tier.toLowerCase()] || tier
  }

  const handleCreateNotification = () => {
    setFormData({ 
      title: "", 
      body: "", 
      targetTier: "all", 
      type: "general",
      scheduledDate: "",
      scheduledTime: ""
    })
    setEditingNotification(null)
    setShowModal(true)
    setError(null)
  }

  const handleEditNotification = (notif: Notification) => {
    setEditingNotification(notif)
    const scheduledDate = notif.scheduledFor ? new Date(notif.scheduledFor).toISOString().split('T')[0] : ""
    const scheduledTime = notif.scheduledFor ? new Date(notif.scheduledFor).toTimeString().slice(0, 5) : ""
    setFormData({
      title: notif.title,
      body: notif.body,
      targetTier: notif.targetTier,
      type: notif.type || "general",
      scheduledFor: notif.scheduledFor,
      scheduledDate,
      scheduledTime
    })
    setShowModal(true)
    setError(null)
  }

  const handleSaveNotification = async () => {
    // Validation
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }
    if (!formData.body.trim()) {
      setError("Body is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Combine date and time for scheduledFor
      let scheduledFor: string | undefined = undefined
      if (formData.scheduledDate && formData.scheduledTime) {
        const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)
        scheduledFor = dateTime.toISOString()
      } else if (formData.scheduledDate) {
        const dateTime = new Date(`${formData.scheduledDate}T00:00:00`)
        scheduledFor = dateTime.toISOString()
      }

      const notificationData: CreateNotificationData = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        targetTier: formData.targetTier || "all",
        type: formData.type || "general",
        ...(scheduledFor && { scheduledFor }),
      }

      const response = await notificationsService.createNotification(notificationData)

      if (response.success) {
        setShowModal(false)
        setEditingNotification(null)
        
        // Refresh notifications list
        const apiStatus = statusFilter === "All" ? "all" : statusFilter.toLowerCase()
        const refreshResponse = await notificationsService.getAllNotifications({
          search: searchTerm || undefined,
          status: apiStatus as any,
          page: 1,
          limit: 100,
        })
        if (refreshResponse.success && refreshResponse.data) {
          // Handle nested response structure: data.data contains the array
          let notificationsList: Notification[] = []
          if (Array.isArray(refreshResponse.data)) {
            notificationsList = refreshResponse.data
          } else if (refreshResponse.data.data && Array.isArray(refreshResponse.data.data)) {
            notificationsList = refreshResponse.data.data
          } else if (refreshResponse.data.notifications && Array.isArray(refreshResponse.data.notifications)) {
            notificationsList = refreshResponse.data.notifications
          }
          setNotifications(notificationsList)
        }
      } else {
        setError(response.error || 'Failed to create notification')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Send and manage member notifications</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications by title, message, or recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto flex-1">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                  statusFilter === status
                    ? "bg-accent text-accent-foreground"
                    : "bg-card/50 border border-border/50 text-foreground hover:border-accent"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <button
            onClick={handleCreateNotification}
            className="px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all flex items-center gap-2 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Send Notification
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sent",
            value: notifications.filter((n) => (n.status || (n.scheduledFor ? "Scheduled" : "Sent")) === "Sent").length.toString(),
            icon: "✓",
          },
          {
            label: "Scheduled",
            value: notifications.filter((n) => (n.status || (n.scheduledFor ? "Scheduled" : "Sent")) === "Scheduled").length.toString(),
            icon: "📅",
          },
          {
            label: "Drafts",
            value: notifications.filter((n) => (n.status || (n.scheduledFor ? "Scheduled" : "Sent")) === "Draft").length.toString(),
            icon: "📝",
          },
          { label: "All Notifications", value: notifications.length.toString(), icon: "🔔" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl opacity-30">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card/30 border border-border/30 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredNotifications.map((notif) => {
              const notifStatus = notif.status || (notif.scheduledFor ? "Scheduled" : "Sent")
              const dateStr = notif.scheduledFor || notif.createdAt || ""
              return (
                <div key={notif.id} className="p-6 hover:bg-accent/5 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-lg text-foreground">{notif.title}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notifStatus)}`}>
                          {notifStatus}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{notif.body}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>To: {formatTargetTier(notif.targetTier)}</span>
                        <span>•</span>
                        <span>Type: {notif.type || "general"}</span>
                        {dateStr && (
                          <>
                            <span>•</span>
                            <span>
                              {formatDate(dateStr)} {formatTime(dateStr) && `at ${formatTime(dateStr)}`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditNotification(notif)}
                        className="p-2 hover:bg-accent/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-accent" />
                      </button>
                      <button
                        onClick={() => setDeletingNotification(notif)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingNotification ? "Edit Notification" : "Send Notification"}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Notification Title *</label>
                <input
                  type="text"
                  placeholder="Enter notification title (max 100 characters)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.title.length}/100</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Message *</label>
                <textarea
                  placeholder="Enter notification message (max 500 characters)"
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  maxLength={500}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.body.length}/500</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Target Tier</label>
                <select
                  value={formData.targetTier || "all"}
                  onChange={(e) => setFormData({ ...formData, targetTier: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All Members</option>
                  <option value="blanco">Blanco Members</option>
                  <option value="reposado">Reposado Members</option>
                  <option value="Añejo">Añejo Members</option>
                  <option value="secret">Secret Members</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Type</label>
                <select
                  value={formData.type || "general"}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="general">General</option>
                  <option value="promotions">Promotions</option>
                  <option value="events">Events</option>
                  <option value="membership">Membership</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Schedule Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.scheduledDate || ""}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Schedule Time (Optional)</label>
                  <input
                    type="time"
                    value={formData.scheduledTime || ""}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setError(null)
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotification}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingNotification ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {editingNotification ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingNotification && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Delete Notification?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingNotification.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingNotification(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("[v0] Notification deleted:", deletingNotification.id)
                  setDeletingNotification(null)
                }}
                className="flex-1 px-4 py-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
