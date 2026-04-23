import { useEffect, useState } from 'react'
import { getProducts } from '../lib/productApi'
import { formatCurrency } from '../lib/productUtils'
import heroImage from '../assets/hero.png'

// Put your image files in: public/product-images/
// File names below are based on your item number.
const productImageMap = {
  '11110': '/product-images/11110.png',
  '11111': '/product-images/11111.png',
  '11112': '/product-images/11112.png',
  '11113': '/product-images/11113.png',
  '11114': '/product-images/11114.png',
  '11115': '/product-images/11115.png',
  '11116': '/product-images/11116.png',
  '11117': '/product-images/11117.png',
  '11118': '/product-images/11118.png',
  '11119': '/product-images/11119.png',
}

function UserDashboard({ setIsLoggedIn }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const getProductImage = (product) => {
    if (typeof product.image_url === 'string' && product.image_url.trim()) {
      return product.image_url.trim()
    }

    const mappedImage = productImageMap[product.item_number]

    if (mappedImage) {
      return mappedImage
    }

    return heroImage
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 px-8 py-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            
            <h1 className="text-2xl font-bold">Inventory System</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">Welcome!</span>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <button
              key={stat.key}
              type="button"
              onClick={() => setStockFilter(stat.key)}
              className={`rounded-lg bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg ${
                stockFilter === stat.key ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              <h3 className="mb-3 text-sm text-gray-600">{stat.label}</h3>
              <div className="mb-4 text-4xl font-bold text-gray-900">{stat.value}</div>
              <div className={`h-2 rounded ${stat.color}`} />
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded border-l-4 border-red-500 bg-red-50 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow">
          <div className="mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Product List</h2>
              <p className="text-sm text-gray-500">
                {stockFilter === 'low'
                  ? 'Showing low stock items only.'
                  : stockFilter === 'out'
                    ? 'Showing out of stock items only.'
                    : stockFilter === 'in'
                      ? 'Showing in stock items only.'
                      : 'Browse inventory from the user homepage.'}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">Search</span>
              <input
                type="text"
                placeholder="Search product"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 pl-20 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
              Loading products...
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
              No products found.
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <img
                      src={getProductImage(product)}
                      alt={`${product.name} product`}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = heroImage
                      }}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">Item #{product.item_number}</p>
                  <p className="mt-4 text-sm text-gray-600">
                    {product.description || 'No description provided yet.'}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                    <span>Quantity: {product.quantity}</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

    </div>
  )
}

export default UserDashboard
