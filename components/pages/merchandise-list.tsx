"use client"

import { Plus, Edit, Trash2, Package, X, Search, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { merchandiseService } from "@/lib/api/merchandise"
import type { Product } from "@/lib/types/merchandise"

// Type for formatted product display
type FormattedProduct = {
  id: string
  name: string
  description: string
  category: string
  price: string
  stock: number
  available: boolean
  image: string
  rawProduct: Product
}

// Helper function to format API product to component format
const formatProductForDisplay = (product: Product): FormattedProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: `$${product.price.toFixed(2)}`,
    stock: product.stockQuantity,
    available: product.availableForPurchase && product.inStock,
    image: product.images[0] || "",
    rawProduct: product,
  }
}

export function MerchandiseList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<FormattedProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<FormattedProduct | null>(null)
  const [formData, setFormData] = useState({ name: "", price: "", stock: "", category: "", description: "" })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // API state
  const [apiProducts, setApiProducts] = useState<FormattedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [stats, setStats] = useState({ totalItems: 0, available: 0, inventoryValue: 0 })

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await merchandiseService.getAllProducts({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (response.success && response.data) {
          const formattedProducts = response.data.products.map(formatProductForDisplay)
          setApiProducts(formattedProducts)
          setPagination(response.data.pagination)
          setStats(response.data.stats)
        } else {
          setError(response.error || 'Failed to fetch products')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, searchTerm])

  const filteredProducts = apiProducts

  const handleCreateProduct = () => {
    setFormData({ name: "", price: "", stock: "", category: "", description: "" })
    setSelectedImages([])
    setSubmitError(null)
    setShowModal(true)
  }

  const handleEditProduct = (product: FormattedProduct) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.replace("$", ""),
      stock: product.stock.toString(),
      category: product.category,
      description: product.description,
    })
    setSelectedImages([])
    setSubmitError(null)
    setShowModal(true)
  }

  const handleDeleteProduct = (product: FormattedProduct) => {
    setDeletingProduct(product)
  }

  const confirmDelete = async () => {
    if (!deletingProduct) return

    setIsSubmitting(true)
    try {
      const response = await merchandiseService.deleteProduct(deletingProduct.id)
      
      if (response.success) {
        setDeletingProduct(null)
        
        // Refresh products list
        const refreshResponse = await merchandiseService.getAllProducts({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedProducts = refreshResponse.data.products.map(formatProductForDisplay)
          setApiProducts(formattedProducts)
          setPagination(refreshResponse.data.pagination)
          setStats(refreshResponse.data.stats)
        }
      } else {
        setError(response.error || 'Failed to delete product')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedImages(files)
    }
  }

  const saveProduct = async () => {
    // Validation
    if (!formData.name.trim()) {
      setSubmitError("Product name is required")
      return
    }
    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      setSubmitError("Valid price is required")
      return
    }
    if (!formData.category.trim()) {
      setSubmitError("Category is required")
      return
    }
    if (!formData.stock.trim() || isNaN(parseInt(formData.stock))) {
      setSubmitError("Valid stock quantity is required")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        stockQuantity: parseInt(formData.stock),
        availableForPurchase: true,
        inStock: parseInt(formData.stock) > 0,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      }

      let response
      if (editingProduct) {
        // Update product
        response = await merchandiseService.updateProduct({
          ...productData,
          id: editingProduct.id,
        })
      } else {
        // Create product
        response = await merchandiseService.createProduct(productData)
      }

      if (response.success) {
        // Close modal and refresh list
        setShowModal(false)
        setEditingProduct(null)
        setSelectedImages([])
        
        // Refresh products list
        const refreshResponse = await merchandiseService.getAllProducts({
          page: currentPage,
          limit: 20,
          search: searchTerm || undefined,
        })

        if (refreshResponse.success && refreshResponse.data) {
          const formattedProducts = refreshResponse.data.products.map(formatProductForDisplay)
          setApiProducts(formattedProducts)
          setPagination(refreshResponse.data.pagination)
          setStats(refreshResponse.data.stats)
        }
      } else {
        setSubmitError(response.error || 'Failed to save product')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products by name, category, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        />
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stats.totalItems.toString(), icon: "📦" },
          { label: "Available", value: stats.available.toString(), icon: "✓" },
          { label: "Search Results", value: filteredProducts.length.toString(), icon: "🔍" },
          { label: "Inventory Value", value: `$${stats.inventoryValue.toFixed(2)}`, icon: "💰" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-6 hover:border-accent/30 transition-all"
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

      <button
        onClick={handleCreateProduct}
        className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40"
      >
        <Plus className="w-5 h-5" />
        Create New Product
      </button>

      <div className="bg-card/30 border border-border/30 rounded-xl overflow-hidden backdrop-blur-sm">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-6 hover:bg-accent/5 transition-all duration-200 hover:border-l-2 hover:border-l-accent"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-accent/20"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-accent/20">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground text-lg">{product.name}</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.available ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {product.available ? "Available" : "Out of Stock"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">{product.category}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div>
                      <p className="text-2xl font-bold text-accent">{product.price}</p>
                      <p
                        className={`text-xs font-medium mt-1 ${product.stock > 0 ? "text-accent" : "text-destructive"}`}
                      >
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2.5 hover:bg-accent/10 rounded-lg transition-all duration-200 border border-transparent hover:border-accent/30"
                      >
                        <Edit className="w-4 h-4 text-muted-foreground hover:text-accent" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2.5 hover:bg-destructive/10 rounded-lg transition-all duration-200 border border-transparent hover:border-destructive/30"
                      >
                        <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No products found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/30 bg-muted/10 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages} • Total {pagination.total} products
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingProduct(null)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Product Name</label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Description</label>
                <textarea
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  >
                    <option value="">Select category</option>
                    <option>T-Shirts</option>
                    <option>Hoodies</option>
                    <option>Hats</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">Price</label>
                  <input
                    type="text"
                    placeholder="$0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Stock Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-2">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {selectedImages.length} image(s) selected
                  </div>
                )}
                {editingProduct && editingProduct.image && selectedImages.length === 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Current image:</p>
                    <img src={editingProduct.image} alt={editingProduct.name} className="w-20 h-20 rounded-lg object-cover border border-border" />
                  </div>
                )}
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProduct}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium shadow-lg shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingProduct ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Create Product"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deletingProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-8 space-y-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Delete Product?</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingProduct.name}"</span>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors font-medium shadow-lg shadow-destructive/30"
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
