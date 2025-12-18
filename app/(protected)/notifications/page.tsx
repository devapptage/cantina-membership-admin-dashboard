"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Send, X } from "lucide-react"

const notificationsData = [
  {
    id: 1,
    title: "Winter Event Reminder",
    message: "Dont miss our winter celebration this Saturday",
    recipients: "All Members",
    status: "Sent",
    date: "10/12/2024",
    time: "2:30 PM",
  },
  {
    id: 2,
    title: "New Product Launch",
    message: "Check out our exclusive limited edition merchandise",
    recipients: "Anejo & Secret Members",
    status: "Sent",
    date: "08/12/2024",
    time: "10:00 AM",
  },
  {
    id: 3,
    title: "Membership Renewal",
    message: "Your membership expires in 30 days. Renew now to continue enjoying benefits",
    recipients: "Expiring Members",
    status: "Draft",
    date: "12/12/2024",
    time: "3:45 PM",
  },
  {
    id: 4,
    title: "Exclusive Tasting Event",
    message: "VIP members invited to our exclusive tasting night",
    recipients: "Secret Members",
    status: "Sent",
    date: "05/12/2024",
    time: "5:15 PM",
  },
  {
    id: 5,
    title: "Holiday Promotion",
    message: "Get 20% off all merchandise this holiday season",
    recipients: "All Members",
    status: "Scheduled",
    date: "15/12/2024",
    time: "12:00 PM",
  },
]

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState<(typeof notificationsData)[0] | null>(null)
  const [formData, setFormData] = useState({ title: "", message: "", recipients: "", status: "" })
  const [deletingNotification, setDeletingNotification] = useState<(typeof notificationsData)[0] | null>(null)

  const statuses = ["All", "Sent", "Draft", "Scheduled"]

  const filteredNotifications = notificationsData.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.recipients.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || notif.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const handleCreateNotification = () => {
    setFormData({ title: "", message: "", recipients: "", status: "Draft" })
    setEditingNotification(null)
    setShowModal(true)
  }

  const handleEditNotification = (notif: (typeof notificationsData)[0]) => {
    setEditingNotification(notif)
    setFormData({
      title: notif.title,
      message: notif.message,
      recipients: notif.recipients,
      status: notif.status,
    })
    setShowModal(true)
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sent",
            value: notificationsData.filter((n) => n.status === "Sent").length.toString(),
            icon: "✓",
          },
          {
            label: "Scheduled",
            value: notificationsData.filter((n) => n.status === "Scheduled").length.toString(),
            icon: "📅",
          },
          {
            label: "Drafts",
            value: notificationsData.filter((n) => n.status === "Draft").length.toString(),
            icon: "📝",
          },
          { label: "All Notifications", value: notificationsData.length.toString(), icon: "🔔" },
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
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredNotifications.map((notif) => (
              <div key={notif.id} className="p-6 hover:bg-accent/5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg text-foreground">{notif.title}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notif.status)}`}>
                        {notif.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{notif.message}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>To: {notif.recipients}</span>
                      <span>•</span>
                      <span>
                        {notif.date} at {notif.time}
                      </span>
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
            ))}
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
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Notification Title</label>
                <input
                  type="text"
                  placeholder="Enter notification title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Message</label>
                <textarea
                  placeholder="Enter notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Recipients</label>
                <select
                  value={formData.recipients}
                  onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Select recipients</option>
                  <option>All Members</option>
                  <option>Blanco Members</option>
                  <option>Reposado Members</option>
                  <option>Anejo Members</option>
                  <option>Secret Members</option>
                  <option>Expiring Members</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Draft</option>
                  <option>Send Now</option>
                  <option>Schedule</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("[v0] Notification saved:", formData)
                    setShowModal(false)
                  }}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {editingNotification ? "Update" : "Send"}
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
