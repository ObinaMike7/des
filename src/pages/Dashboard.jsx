import { useEffect, useState } from 'react'
import { addProduct, deleteProduct, getProducts, updateProduct } from '../lib/productApi'
import {
  buildNewProductPayload,
  buildUpdatedProductPayload,
  emptyEditProductForm,
  emptyProductForm,
  formatCurrency,
} from '../lib/productUtils'

function Dashboard({ setIsLoggedIn, isAdmin }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState(emptyProductForm)
  const [editFormData, setEditFormData] = useState(emptyEditProductForm)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getProducts()
      setProducts(data)
    } catch (fetchError) {
      console.error('Fetch products error:', fetchError)
      setError(fetchError.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const clearSuccessMessage = () => {
    window.setTimeout(() => setSuccess(''), 3000)
  }

  const closeAddModal = () => {
    setShowModal(false)
    setFormData(emptyProductForm)
    setError('')
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedProduct(null)
    setEditFormData(emptyEditProductForm)
    setError('')
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setSelectedProduct(null)
    setError('')
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()

    if (!formData.item_number.trim() || !formData.name.trim() || formData.quantity === '') {
      setError('Please fill in required fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      await addProduct(buildNewProductPayload(formData))
      setSuccess('Product added successfully!')
      closeAddModal()
      await fetchProducts()
      clearSuccessMessage()
    } catch (addError) {
      console.error('Add product error:', addError)
      setError(addError.message || 'Failed to add product')
      setLoading(false)
    }
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()

    if (!selectedProduct) {
      return
    }

    if (!editFormData.name.trim() || editFormData.quantity === '') {
      setError('Please fill in required fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      await updateProduct(selectedProduct.id, buildUpdatedProductPayload(editFormData))
      setSuccess('Product updated successfully!')
      closeEditModal()
      await fetchProducts()
      clearSuccessMessage()
    } catch (editError) {
      console.error('Edit product error:', editError)
      setError(editError.message || 'Failed to update product')
      setLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) {
      return
    }

    try {
      setLoading(true)
      setError('')
      await deleteProduct(selectedProduct.id)
      setSuccess('Product deleted successfully!')
      closeDeleteModal()
      await fetchProducts()
      clearSuccessMessage()
    } catch (deleteError) {
      console.error('Delete product error:', deleteError)
      setError(deleteError.message || 'Failed to delete product')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
  }

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesStockFilter =
      stockFilter === 'all' ||
      (stockFilter === 'low' && product.quantity > 0 && product.quantity < 10) ||
      (stockFilter === 'out' && product.quantity === 0) ||
      (stockFilter === 'in' && product.quantity > 0)

    if (!matchesStockFilter) {
      return false
    }

    if (!query) {
      return true
    }

    return (
      product.name.toLowerCase().includes(query) ||
      product.item_number.toLowerCase().includes(query)
    )
  })

  const stats = [
    { key: 'all', label: 'Total Product', value: products.length, color: 'bg-blue-600' },
    { key: 'low', label: 'Low Stock Item', value: products.filter((product) => product.quantity > 0 && product.quantity < 10).length, color: 'bg-orange-500' },
    { key: 'out', label: 'Out of Stock Item', value: products.filter((product) => product.quantity === 0).length, color: 'bg-red-600' },
    { key: 'in', label: 'In Stock', value: products.filter((product) => product.quantity > 0).length, color: 'bg-green-600' },
  ]

  return (
    <div className={`min-h-screen ${isAdmin ? 'bg-[#4E6688]' : 'bg-slate-100'}`}>
      <header className="bg-slate-900 px-8 py-4 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Welcome{isAdmin ? ' Admin' : ''}!</h1>
          <button
            onClick={handleLogout}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="space-y-8 p-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setStockFilter(stat.key)}
              className={`rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                stockFilter === stat.key ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <div className="mb-4 text-sm text-slate-500">{stat.label}</div>
              <div className="mb-6 text-4xl font-bold text-slate-900">{stat.value}</div>
              <div className={`h-2 rounded-full ${stat.color}`} />
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded border-l-4 border-green-500 bg-green-50 p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Product List</h2>
              <p className="text-sm text-slate-500">
                {stockFilter === 'low'
                  ? 'Showing low stock items only.'
                  : stockFilter === 'out'
                    ? 'Showing out of stock items only.'
                    : stockFilter === 'in'
                      ? 'Showing in stock items only.'
                      : 'Showing all inventory items.'}
              </p>
            </div>
            <button
              onClick={() => {
                setError('')
                setShowModal(true)
              }}
              className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Add New Product
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Search</span>
              <input
                type="text"
                placeholder="Search product"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pl-20 text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full border-separate border-spacing-0">
              <thead className="bg-slate-100 text-left text-slate-600">
                <tr>
                  <th className="px-6 py-4">Item Number</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-600">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-600">
                      No products found
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.map((product, idx) => (
                  <tr key={product.id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-slate-100'}>
                    <td className="border-t border-slate-200 px-6 py-4 text-slate-900">{product.item_number}</td>
                    <td className="border-t border-slate-200 px-6 py-4 text-slate-900">{product.name}</td>
                    <td className="border-t border-slate-200 px-6 py-4 text-slate-900">{product.quantity}</td>
                    <td className="border-t border-slate-200 px-6 py-4 text-slate-900">{formatCurrency(product.price)}</td>
                    <td className="border-t border-slate-200 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setError('')
                            setSelectedProduct(product)
                            setEditFormData({
                              id: product.id,
                              name: product.name,
                              description: product.description || '',
                              quantity: String(product.quantity),
                              price: product.price === null ? '' : String(product.price),
                            })
                            setShowEditModal(true)
                          }}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setError('')
                            setSelectedProduct(product)
                            setShowDeleteModal(true)
                          }}
                          className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add New Product</h3>
              <button onClick={closeAddModal} className="text-slate-500 transition hover:text-slate-900">
                Close
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded border-l-4 border-red-500 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Item Number *</label>
                <input
                  type="text"
                  value={formData.item_number}
                  onChange={(e) => setFormData({ ...formData, item_number: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter item number"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter description (optional)"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter price (optional)"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Edit Product</h3>
              <button onClick={closeEditModal} className="text-slate-500 transition hover:text-slate-900">
                Close
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded border-l-4 border-red-500 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleEditProduct} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Item Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter description"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.quantity}
                  onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter price"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Delete Product</h3>
              <button onClick={closeDeleteModal} className="text-slate-500 transition hover:text-slate-900">
                Close
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded border-l-4 border-red-500 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <p className="text-slate-600">Are you sure you want to delete this product?</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                  <strong>Item Number:</strong> {selectedProduct.item_number}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Item Name:</strong> {selectedProduct.name}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Quantity:</strong> {selectedProduct.quantity}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={loading}
                className="rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:bg-slate-400"
              >
                {loading ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
