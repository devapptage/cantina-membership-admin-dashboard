"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, Download, X, ChevronLeft, ChevronRight } from "lucide-react"
import { ordersService } from "@/lib/api/orders"
import type { Order } from "@/lib/types/orders"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const limit = 20
  
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Order> | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)

  const statuses = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]

  // Fetch orders
  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params: any = {
        page: currentPage,
        limit,
        type: "merchandise", // Only merchandise orders
      }
      
      if (searchTerm) {
        params.search = searchTerm
      }
      
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter
      }
      
      console.log('[Orders Page] Fetching orders with params:', params)
      
      const response = await ordersService.getAllOrders(params)
      
      console.log('[Orders Page] API Response:', response)
      
      if (response.success && response.data) {
        setOrders(response.data.orders)
        setTotalPages(response.data.pagination.totalPages)
        setTotalOrders(response.data.pagination.total)
      } else {
        setError(response.error || 'Failed to fetch orders')
        setOrders([])
      }
    } catch (err) {
      console.error('[Orders Page] Error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchOrders()
      } else {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredOrders = orders

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
      case "completed":
        return "bg-accent/10 text-accent"
      case "in_transit":
        return "bg-blue-500/10 text-blue-400"
      case "processing":
        return "bg-amber-500/10 text-amber-400"
      case "pending":
        return "bg-orange-500/10 text-orange-400"
      case "cancelled":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent"
      case "pending":
        return "text-amber-400"
      case "failed":
        return "text-red-400"
      case "refunded":
        return "text-blue-400"
      default:
        return "text-muted-foreground"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleExportOrders = () => {
    const headers = ["Order ID", "Customer", "Email", "Items", "Total", "Status", "Date", "Payment"]
    const csvContent = [
      headers.join(","),
      ...filteredOrders.map((order) =>
        [
          order.orderId,
          order.customerName,
          order.customerEmail,
          order.itemCount,
          order.totalAmount,
          order.status,
          formatDate(order.createdAt),
          order.paymentStatus
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    console.log("[Orders Page] Exported orders to CSV")
  }

  const handleUpdateOrder = async () => {
    if (!editingOrder || !editFormData) return

    try {
      const response = await ordersService.updateOrder({
        orderId: editingOrder.id,
        status: editFormData.status as any,
        paymentStatus: editFormData.paymentStatus as any,
        trackingNumber: editFormData.trackingNumber,
        notes: editFormData.notes,
      })

      if (response.success) {
        console.log('[Orders Page] Order updated successfully')
        setEditingOrder(null)
        setEditFormData(null)
        fetchOrders()
      } else {
        alert(response.error || 'Failed to update order')
      }
    } catch (err) {
      console.error('[Orders Page] Update error:', err)
      alert('Failed to update order')
    }
  }

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return

    try {
      const response = await ordersService.deleteOrder(deletingOrder.id)

      if (response.success) {
        console.log('[Orders Page] Order deleted successfully')
        setDeletingOrder(null)
        fetchOrders()
      } else {
        alert(response.error || 'Failed to delete order')
      }
    } catch (err) {
      console.error('[Orders Page] Delete error:', err)
      alert('Failed to delete order')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all merchandise orders</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
            {statuses.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all disabled:opacity-50 ${
                  statusFilter === status.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-card/50 border border-border/50 text-foreground hover:border-accent"
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportOrders}
            disabled={isLoading || orders.length === 0}
            className="px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all flex items-center gap-2 font-medium text-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: isLoading ? "..." : totalOrders.toString(), icon: "📦" },
          {
            label: "Delivered",
            value: isLoading ? "..." : orders.filter((o) => o.status === "delivered" || o.status === "completed").length.toString(),
            icon: "✓",
          },
          {
            label: "Processing",
            value: isLoading ? "..." : orders.filter((o) => o.status === "processing").length.toString(),
            icon: "⚙️",
          },
          {
            label: "Total Revenue",
            value: isLoading ? "..." : formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0)),
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
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-accent/5 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg text-foreground">{order.orderId}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                      <span>•</span>
                      <span>{formatDate(order.createdAt)}</span>
                      {order.trackingNumber && (
                        <>
                          <span>•</span>
                          <span className="text-accent">Tracking: {order.trackingNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-accent">{formatCurrency(order.totalAmount)}</p>
                    <p className={`text-xs font-medium mt-2 ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {formatStatus(order.paymentStatus)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalOrders} total orders)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {editingOrder && editFormData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Order</h2>
              <button onClick={() => setEditingOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Order ID</label>
                <input
                  type="text"
                  value={editingOrder.orderId}
                  disabled
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {statuses.slice(1).map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Payment Status</label>
                <select
                  value={editFormData.paymentStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={editFormData.trackingNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number..."
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Notes</label>
                <textarea
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateOrder}
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
              Are you sure you want to delete order{" "}
              <span className="font-semibold text-foreground">"{deletingOrder.orderId}"</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingOrder(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
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
