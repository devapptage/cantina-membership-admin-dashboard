"use client"

import { useState, useEffect } from "react"
import { Search, Edit, History, X, Calendar, TrendingUp, Download, ArrowUpDown, Loader2, Trash2, User as UserIcon, Eye } from "lucide-react"
import { usersService } from "@/lib/api/users"
import type { User } from "@/lib/types/users"
import { useRouter } from "next/navigation"

// Type for formatted user display
type FormattedUser = {
  id: string
  name: string
  email: string
  phone: string
  membership: string
  joined: string
  transactions: string
  avatar: string
  status: string
  membershipDate: string
  lastPurchase: string
  totalSpent: string
  rawUser: User // Keep original for editing
}

// Helper function to format API user to component format
const formatUserForDisplay = (user: User): FormattedUser => {
  const fullName = `${user.firstName} ${user.lastName}`
  const membership = user.membershipStatus === 'none' 
    ? 'No Membership' 
    : `${user.membershipStatus.toUpperCase()} MEMBER`
  
  const joinedDate = new Date(user.joinDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return {
    id: user.id,
    name: fullName,
    email: user.email,
    phone: user.phone,
    membership: membership,
    joined: joinedDate,
    transactions: `${user.punchCard.punches} transactions`,
    avatar: user.profileImage || "👤",
    status: user.membership?.status === 'active' ? "Active" : "Inactive",
    membershipDate: user.membership?.startDate 
      ? new Date(user.membership.startDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : "-",
    lastPurchase: "-", // Not in API response
    totalSpent: "$0.00", // Not in API response
    rawUser: user, // Keep original for editing
  }
}

const membershipTabs = ["All", "Blanco", "Reposado", "Anejo", "Secret", "None"]

export function UsersList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [editingUser, setEditingUser] = useState<FormattedUser | null>(null)
  const [userHistory, setUserHistory] = useState<FormattedUser | null>(null)
  const [deletingUser, setDeletingUser] = useState<FormattedUser | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "joined" | "spent">("name")
  const [editFormData, setEditFormData] = useState<FormattedUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // API state
  const [apiUsers, setApiUsers] = useState<FormattedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Map tab to API membershipStatus format
        // "All" -> "all", others -> lowercase
        const membershipStatus = activeTab === "All" ? "all" : activeTab.toLowerCase()
        
        const response = await usersService.getAllUsers({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          membershipStatus: membershipStatus,
        })

        if (response.success && response.data) {
          const formattedUsers = response.data.users.map(formatUserForDisplay)
          setApiUsers(formattedUsers)
          setPagination(response.data.pagination)
        } else {
          setError(response.error || 'Failed to fetch users')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, activeTab, searchTerm])

  // Use API users
  const displayUsers = apiUsers

  // Client-side filtering and sorting (if API doesn't handle it)
  const filteredUsers = displayUsers
    .filter((user) => {
      // If using API, search is handled server-side, but we can still filter locally if needed
      if (apiUsers.length > 0) {
        // API already filtered, just sort
        return true
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "joined") {
        const aDate = new Date(a.joined.split('/').reverse().join('-'))
        const bDate = new Date(b.joined.split('/').reverse().join('-'))
        return bDate.getTime() - aDate.getTime()
      }
      if (sortBy === "spent") {
        const aVal = Number.parseFloat(a.totalSpent.replace(/[^0-9.-]+/g, ""))
        const bVal = Number.parseFloat(b.totalSpent.replace(/[^0-9.-]+/g, ""))
        return bVal - aVal
      }
      return 0
    })

  const handleEditUser = (user: FormattedUser) => {
    setEditingUser(user)
    setEditFormData({ ...user })
  }

  const handleSaveUser = async () => {
    if (!editFormData || !editingUser) {
      console.error("[Users List] Cannot save: editFormData or editingUser is null")
      return
    }

    // Validate userId
    if (!editingUser.id || editingUser.id.trim() === "") {
      console.error("[Users List] Cannot save: editingUser.id is missing or empty", editingUser)
      setError("User ID is missing. Please try again.")
      return
    }

    try {
      // Parse name into firstName and lastName
      const nameParts = (editFormData.name || "").trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      // Map membership status from display format to API format
      let membershipStatus: string | undefined
      if (editFormData.membership) {
        if (editFormData.membership.includes("BLANCO")) {
          membershipStatus = "blanco"
        } else if (editFormData.membership.includes("REPOSADO")) {
          membershipStatus = "reposado"
        } else if (editFormData.membership.includes("ANEJO")) {
          membershipStatus = "anejo"
        } else if (editFormData.membership.includes("SECRET")) {
          membershipStatus = "secret"
        } else if (editFormData.membership === "No Membership") {
          membershipStatus = "none"
        }
      }

      // Get userId from either editingUser.id or rawUser.id (fallback)
      const userId = editingUser.id?.trim() || editingUser.rawUser?.id?.trim()
      
      if (!userId) {
        console.error("[Users List] Cannot find userId in editingUser:", editingUser)
        setError("User ID is missing. Please try again.")
        return
      }

      // Prepare update data (DO NOT include email)
      const updateData: {
        userId: string
        firstName?: string
        lastName?: string
        phone?: string
        membershipStatus?: string
      } = {
        userId: userId, // Use the validated userId
      }
      
      console.log("[Users List] Editing user ID:", userId)
      console.log("[Users List] Editing user object:", editingUser)
      console.log("[Users List] Update data before adding fields:", updateData)

      // Only include fields that have changed or are provided
      if (firstName) updateData.firstName = firstName
      if (lastName) updateData.lastName = lastName
      if (editFormData.phone) updateData.phone = editFormData.phone
      if (membershipStatus) updateData.membershipStatus = membershipStatus

      console.log("[Users List] Updating user with data:", updateData)

      const response = await usersService.updateUser(updateData)

      if (response.success) {
        console.log("[Users List] User updated successfully")
        setEditingUser(null)
        setEditFormData(null)
        
        // Refresh users list
        const refreshResponse = await usersService.getAllUsers({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          membershipStatus: activeTab === "All" ? "all" : activeTab.toLowerCase(),
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedUsers = refreshResponse.data.users.map(formatUserForDisplay)
          setApiUsers(formattedUsers)
          setPagination(refreshResponse.data.pagination)
        }
      } else {
        console.error("[Users List] Failed to update user:", response.error)
        setError(response.error || 'Failed to update user')
      }
    } catch (err) {
      console.error("[Users List] Error updating user:", err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  const handleViewHistory = (user: FormattedUser) => {
    setUserHistory(user)
  }

  const handleViewProfile = (user: FormattedUser) => {
    router.push(`/users/${user.id}`)
  }

  const handleDeleteUser = (user: FormattedUser) => {
    setDeletingUser(user)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return

    setIsDeleting(true)
    try {
      const userId = deletingUser.id?.trim() || deletingUser.rawUser?.id?.trim()
      
      if (!userId) {
        setError("User ID is missing. Cannot delete user.")
        setDeletingUser(null)
        setIsDeleting(false)
        return
      }

      const response = await usersService.deleteUser(userId)

      if (response.success) {
        setDeletingUser(null)
        
        // Refresh users list
        const refreshResponse = await usersService.getAllUsers({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          membershipStatus: activeTab === "All" ? "all" : activeTab.toLowerCase(),
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedUsers = refreshResponse.data.users.map(formatUserForDisplay)
          setApiUsers(formattedUsers)
          setPagination(refreshResponse.data.pagination)
        }
      } else {
        setError(response.error || 'Failed to delete user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportUsers = () => {
    const headers = ["Name", "Email", "Phone", "Membership", "Status", "Joined", "Total Spent"]
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user) =>
        [user.name, user.email, user.phone, user.membership, user.status, user.joined, user.totalSpent].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    console.log("[v0] Exported users to CSV")
  }

  const getMembershipColor = (membership: string) => {
    if (membership.includes("BLANCO")) return "text-blue-400"
    if (membership.includes("REPOSADO")) return "text-amber-400"
    if (membership.includes("ANEJO")) return "text-amber-600"
    if (membership.includes("SECRET")) return "text-purple-400"
    return "text-gray-400"
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Static (not sticky) */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        {/* Tabs with Horizontal Scroll */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto flex-1 min-w-0 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent pb-2">
            {membershipTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-200 text-sm flex-shrink-0 ${
                  activeTab === tab
                    ? "bg-accent text-accent-foreground shadow-lg shadow-accent/30"
                    : "bg-card/50 border border-border/50 text-foreground hover:border-accent hover:bg-accent/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportUsers}
            className="px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all duration-200 flex items-center gap-2 font-medium text-sm hover:shadow-lg hover:shadow-accent/20 whitespace-nowrap flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground flex items-center gap-2">Sort by:</span>
          {(["name", "joined", "spent"] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                sortBy === sort
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-muted/50 text-muted-foreground border border-border/50 hover:border-border"
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              {sort === "name" ? "Name" : sort === "joined" ? "Joined" : "Total Spent"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Static */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: pagination.total.toString(), icon: "👥" },
          {
            label: "Active Members",
            value: displayUsers.filter((u) => u.status === "Active").length.toString(),
            icon: "✓",
          },
          { label: "Search Results", value: filteredUsers.length.toString(), icon: "🔍" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-6 hover:border-accent/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl opacity-30">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Professional Table */}
      <div className="bg-card/30 border border-border/30 rounded-xl backdrop-blur-sm flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <>
            <div className="overflow-x-auto overflow-y-scroll max-h-[60vh] min-h-[400px] custom-scrollbar" style={{ overscrollBehavior: 'contain' }}>
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Membership</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.status === "Active" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${getMembershipColor(user.membership)}`}>
                          {user.membership}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.joined}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {user.totalSpent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewProfile(user)}
                            className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 text-xs"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5 text-xs"
                            title="Edit User"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleViewHistory(user)}
                            className="px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-foreground hover:bg-muted transition-all flex items-center gap-1.5 text-xs"
                            title="View History"
                          >
                            <History className="w-3.5 h-3.5" />
                            History
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1.5 text-xs"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border/30 bg-muted/10 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {pagination.page} of {pagination.totalPages} • Total {pagination.total} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Previous
                </button>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages || isLoading}
                  className="px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingUser && editFormData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit User Profile</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={editFormData?.name || ""}
                  onChange={(e) => editFormData && setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
                <input
                  type="email"
                  value={editFormData?.email || ""}
                  readOnly
                  disabled
                  className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-lg text-muted-foreground cursor-not-allowed opacity-60"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Phone</label>
                <input
                  type="tel"
                  value={editFormData?.phone || ""}
                  onChange={(e) => editFormData && setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Membership Level</label>
                <select
                  value={editFormData?.membership || ""}
                  onChange={(e) => editFormData && setEditFormData({ ...editFormData, membership: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                >
                  <option>BLANCO MEMBER</option>
                  <option>REPOSADO MEMBER</option>
                  <option>ANEJO MEMBER</option>
                  <option>SECRET MEMBER</option>
                  <option>No Membership</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                <select
                  value={editFormData?.status || ""}
                  onChange={(e) => editFormData && setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Membership Date</label>
                  <input
                    type="text"
                    value={editFormData?.membershipDate || ""}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, membershipDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Total Spent</label>
                  <input
                    type="text"
                    value={editFormData?.totalSpent || ""}
                    onChange={(e) => editFormData && setEditFormData({ ...editFormData, totalSpent: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/30"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Transaction History</h2>
              <button
                onClick={() => setUserHistory(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{userHistory.name}</span> • {userHistory.transactions}
              </p>
              <div className="space-y-3">
                {[
                  { action: "Joined member program", date: userHistory.membershipDate, icon: "✓" },
                  { action: "Purchased merchandise", date: userHistory.lastPurchase, icon: "🛍" },
                  { action: "Attended event", date: "05/01/2024", icon: "🎉" },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 pb-3 border-b border-border/30">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Delete User?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingUser.name}"</span>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors font-medium shadow-lg shadow-destructive/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
