import { API_BASE_URL } from './apiBaseUrl'

const PRODUCTS_API_URL = `${API_BASE_URL}/api/products`

const readJson = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const handleResponse = async (response, fallbackMessage) => {
  const data = await readJson(response)

  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage)
  }

  return data
}

export const getProducts = async () => {
  const response = await fetch(PRODUCTS_API_URL)
  return handleResponse(response, 'Failed to fetch products')
}

export const addProduct = async (product) => {
  const response = await fetch(PRODUCTS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })

  return handleResponse(response, 'Failed to add product')
}

export const updateProduct = async (productId, product) => {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  })

  return handleResponse(response, 'Failed to update product')
}

export const deleteProduct = async (productId) => {
  const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return handleResponse(response, 'Failed to delete product')
}
