"use client"

import { useState, useEffect } from "react"
import { Search, Edit, X, Plus, Loader2, Trash2, User as UserIcon, Shield } from "lucide-react"
import { adminsService } from "@/lib/api/admins"
import type { Admin } from "@/lib/types/admins"

// Type for formatted admin display
type FormattedAdmin = {
  id: string
  name: string
  email: string
  role: string
  joined: string
  password?: string // Optional password field for editing
  rawAdmin: Admin // Keep original for editing
}

// Helper function to format API admin to component format
const formatAdminForDisplay = (admin: Admin): FormattedAdmin => {
  const fullName = `${admin.firstName} ${admin.lastName}`
  
  const joinedDate = new Date(admin.joinDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return {
    id: admin.id,
    name: fullName,
    email: admin.email,
    role: admin.role,
    joined: joinedDate,
    rawAdmin: admin,
  }
}

export function AdminsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingAdmin, setEditingAdmin] = useState<FormattedAdmin | null>(null)
  const [deletingAdmin, setDeletingAdmin] = useState<FormattedAdmin | null>(null)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  const [editFormData, setEditFormData] = useState<FormattedAdmin | null>(null)
  const [createFormData, setCreateFormData] = useState<{
    firstName: string
    lastName: string
    email: string
    password: string
  }>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // API state
  const [apiAdmins, setApiAdmins] = useState<FormattedAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })

  // Fetch admins from API
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await adminsService.getAllAdmins({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (response.success && response.data) {
          const formattedAdmins = response.data.admins.map(formatAdminForDisplay)
          setApiAdmins(formattedAdmins)
          setPagination(response.data.pagination)
        } else {
          setError(response.error || 'Failed to fetch admins')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdmins()
  }, [currentPage, searchTerm])

  const handleEditAdmin = (admin: FormattedAdmin) => {
    setEditingAdmin(admin)
    setEditFormData({ ...admin, password: "" }) // Initialize password as empty
  }

  const handleSaveAdmin = async () => {
    if (!editFormData || !editingAdmin) {
      console.error("[Admins List] Cannot save: editFormData or editingAdmin is null")
      return
    }

    // Validate adminId
    if (!editingAdmin.id || editingAdmin.id.trim() === "") {
      console.error("[Admins List] Cannot save: editingAdmin.id is missing or empty", editingAdmin)
      setError("Admin ID is missing. Please try again.")
      return
    }

    try {
      // Parse name into firstName and lastName
      const nameParts = (editFormData.name || "").trim().split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""

      // Get adminId
      const adminId = editingAdmin.id?.trim() || editingAdmin.rawAdmin?.id?.trim()
      
      if (!adminId) {
        console.error("[Admins List] Cannot find adminId in editingAdmin:", editingAdmin)
        setError("Admin ID is missing. Please try again.")
        return
      }

      // Prepare update data
      const updateData: {
        adminId: string
        firstName?: string
        lastName?: string
        email?: string
        password?: string
      } = {
        adminId: adminId,
      }

      // Only include fields that have changed or are provided
      if (firstName) updateData.firstName = firstName
      if (lastName) updateData.lastName = lastName
      if (editFormData.email) updateData.email = editFormData.email
      // Only include password if it's not empty
      if (editFormData.password && editFormData.password.trim() !== "") {
        updateData.password = editFormData.password
      }

      console.log("[Admins List] Updating admin with data:", { ...updateData, password: updateData.password ? '***' : undefined })

      const response = await adminsService.updateAdmin(updateData)

      if (response.success) {
        console.log("[Admins List] Admin updated successfully")
        setEditingAdmin(null)
        setEditFormData(null)
        
        // Refresh admins list
        const refreshResponse = await adminsService.getAllAdmins({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedAdmins = refreshResponse.data.admins.map(formatAdminForDisplay)
          setApiAdmins(formattedAdmins)
          setPagination(refreshResponse.data.pagination)
        }
      } else {
        console.error("[Admins List] Failed to update admin:", response.error)
        setError(response.error || 'Failed to update admin')
      }
    } catch (err) {
      console.error("[Admins List] Error updating admin:", err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  const handleCreateAdmin = async () => {
    if (!createFormData.firstName || !createFormData.email || !createFormData.password) {
      setError("First name, email, and password are required")
      return
    }

    if (createFormData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsCreating(true)
    try {
      const response = await adminsService.createAdmin(createFormData)

      if (response.success) {
        console.log("[Admins List] Admin created successfully")
        setCreatingAdmin(false)
        setCreateFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        })
        
        // Refresh admins list
        const refreshResponse = await adminsService.getAllAdmins({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedAdmins = refreshResponse.data.admins.map(formatAdminForDisplay)
          setApiAdmins(formattedAdmins)
          setPagination(refreshResponse.data.pagination)
        }
      } else {
        console.error("[Admins List] Failed to create admin:", response.error)
        setError(response.error || 'Failed to create admin')
      }
    } catch (err) {
      console.error("[Admins List] Error creating admin:", err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteAdmin = (admin: FormattedAdmin) => {
    setDeletingAdmin(admin)
  }

  const confirmDeleteAdmin = async () => {
    if (!deletingAdmin) return

    setIsDeleting(true)
    try {
      const adminId = deletingAdmin.id?.trim() || deletingAdmin.rawAdmin?.id?.trim()
      
      if (!adminId) {
        setError("Admin ID is missing. Cannot delete admin.")
        setDeletingAdmin(null)
        setIsDeleting(false)
        return
      }

      const response = await adminsService.deleteAdmin(adminId)

      if (response.success) {
        setDeletingAdmin(null)
        
        // Refresh admins list
        const refreshResponse = await adminsService.getAllAdmins({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedAdmins = refreshResponse.data.admins.map(formatAdminForDisplay)
          setApiAdmins(formattedAdmins)
          setPagination(refreshResponse.data.pagination)
        }
      } else {
        setError(response.error || 'Failed to delete admin')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        {/* Search Bar and Create Button */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setCreatingAdmin(true)}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-lg shadow-accent/30 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Create Admin
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Total Admins", value: pagination.total.toString(), icon: "👥" },
          { label: "Current Page", value: `${pagination.page} / ${pagination.totalPages}`, icon: "📄" },
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
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-destructive hover:text-destructive/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Professional Table */}
      <div className="bg-card/30 border border-border/30 rounded-xl backdrop-blur-sm flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
            <p className="text-muted-foreground">Loading admins...</p>
          </div>
        ) : apiAdmins.length > 0 ? (
          <>
            <div className="overflow-x-auto overflow-y-scroll max-h-[60vh] min-h-[400px] custom-scrollbar" style={{ overscrollBehavior: 'contain' }}>
              <table className="w-full">
                <thead className="bg-muted/30 border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {apiAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-accent/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-accent" />
                          </div>
                          <div className="font-semibold text-foreground">{admin.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent capitalize">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {admin.joined}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditAdmin(admin)}
                            className="px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg text-accent hover:bg-accent/20 transition-all flex items-center gap-1.5 text-xs"
                            title="Edit Admin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="px-3 py-1.5 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive hover:bg-destructive/20 transition-all flex items-center gap-1.5 text-xs"
                            title="Delete Admin"
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
                Showing page {pagination.page} of {pagination.totalPages} • Total {pagination.total} admins
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
            <p className="text-muted-foreground text-lg">No admins found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAdmin && editFormData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Admin</h2>
              <button
                onClick={() => setEditingAdmin(null)}
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
                  onChange={(e) => editFormData && setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Password</label>
                <input
                  type="password"
                  value={editFormData?.password || ""}
                  onChange={(e) => editFormData && setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current password</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdmin}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/30"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creatingAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create New Admin</h2>
              <button
                onClick={() => setCreatingAdmin(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">First Name *</label>
                <input
                  type="text"
                  value={createFormData.firstName}
                  onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Last Name</label>
                <input
                  type="text"
                  value={createFormData.lastName}
                  onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Email *</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Password *</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setCreatingAdmin(false)}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Admin"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Delete Admin?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingAdmin.name}"</span>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingAdmin(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAdmin}
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
