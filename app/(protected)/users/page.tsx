import { UsersList } from "@/components/pages/users-list"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage and monitor all system users and their memberships</p>
      </div>
      <UsersList />
    </div>
  )
}
