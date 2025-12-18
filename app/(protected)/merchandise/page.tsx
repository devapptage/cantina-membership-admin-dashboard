import { MerchandiseList } from "@/components/pages/merchandise-list"

export default function MerchandisePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Merchandise Management</h1>
        <p className="text-muted-foreground mt-1">Manage products, inventory, and merchandise sales</p>
      </div>
      <MerchandiseList />
    </div>
  )
}
