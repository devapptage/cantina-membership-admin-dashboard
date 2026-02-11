import { AdminsList } from "@/components/pages/admins-list"

export default function AdminsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
        <p className="text-muted-foreground mt-2">Manage administrator accounts and permissions</p>
      </div>
      <AdminsList />
    </div>
  )
}
