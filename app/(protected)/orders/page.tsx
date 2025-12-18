"use client"

import { useState } from "react"
import { Search, Edit, Trash2, Download, X } from "lucide-react"

const ordersData = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john.doe@email.com",
    items: 3,
    total: "$450.00",
    status: "Delivered",
    date: "14/12/2024",
    payment: "Completed",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    email: "jane.smith@email.com",
    items: 2,
    total: "$189.99",
    status: "In Transit",
    date: "12/12/2024",
    payment: "Completed",
  },
  {
    id: "ORD-003",
    customer: "Mike Wilson",
    email: "mike.wilson@email.com",
    items: 5,
    total: "$599.95",
    status: "Processing",
    date: "10/12/2024",
    payment: "Pending",
  },
  {
    id: "ORD-004",
    customer: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    items: 1,
    total: "$29.99",
    status: "Pending",
    date: "08/12/2024",
    payment: "Completed",
  },
  {
    id: "ORD-005",
    customer: "Alex Rodriguez",
    email: "alex.rodriguez@email.com",
    items: 4,
    total: "$275.50",
    status: "Delivered",
    date: "05/12/2024",
    payment: "Completed",
  },
]

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [editingOrder, setEditingOrder] = useState<(typeof ordersData)[0] | null>(null)
  const [editFormData, setEditFormData] = useState<(typeof ordersData)[0] | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<(typeof ordersData)[0] | null>(null)

  const statuses = ["All", "Pending", "Processing", "In Transit", "Delivered"]

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "All" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-accent/10 text-accent"
      case "In Transit":
        return "bg-blue-500/10 text-blue-400"
      case "Processing":
        return "bg-amber-500/10 text-amber-400"
      case "Pending":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleExportOrders = () => {
    const headers = ["Order ID", "Customer", "Email", "Items", "Total", "Status", "Date", "Payment"]
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [order.id, order.customer, order.email, order.items, order.total, order.status, order.date, order.payment].join(
          ",",
        ),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    console.log("[v0] Exported orders to CSV")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all customer orders</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
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
            onClick={handleExportOrders}
            className="px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all flex items-center gap-2 font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: ordersData.length.toString(), icon: "📦" },
          {
            label: "Delivered",
            value: ordersData.filter((o) => o.status === "Delivered").length.toString(),
            icon: "✓",
          },
          {
            label: "Processing",
            value: ordersData.filter((o) => o.status === "Processing").length.toString(),
            icon: "⚙️",
          },
          {
            label: "Total Revenue",
            value: `$${ordersData.reduce((sum, o) => sum + Number.parseFloat(o.total.replace("$", "")), 0).toFixed(2)}`,
            icon: "💰",
          },
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
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-accent/5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg text-foreground">{order.id}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-foreground">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{order.items} items</span>
                      <span>•</span>
                      <span>{order.date}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-accent">{order.total}</p>
                    <p
                      className={`text-xs font-medium mt-2 ${order.payment === "Completed" ? "text-accent" : "text-amber-400"}`}
                    >
                      {order.payment}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setEditingOrder(order)
                          setEditFormData({ ...order })
                        }}
                        className="p-2 hover:bg-accent/10 rounded-lg transition-all"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-accent" />
                      </button>
                      <button
                        onClick={() => setDeletingOrder(order)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {editingOrder && editFormData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Order</h2>
              <button onClick={() => setEditingOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {statuses.slice(1).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Payment Status</label>
                <select
                  value={editFormData.payment}
                  onChange={(e) => setEditFormData({ ...editFormData, payment: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("[v0] Order updated:", editFormData)
                    setEditingOrder(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Delete Order?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingOrder.id}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingOrder(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("[v0] Order deleted:", deletingOrder.id)
                  setDeletingOrder(null)
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
