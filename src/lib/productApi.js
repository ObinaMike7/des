import { API_BASE_URL } from './apiBaseUrl'
import { requestJson } from './request'

const PRODUCTS_API_URL = `${API_BASE_URL}/api/products`

export const getProducts = async () => {
  return requestJson(PRODUCTS_API_URL, undefined, 'Failed to fetch products')
}

export const addProduct = async (product) => {
  return requestJson(
    PRODUCTS_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    },
    'Failed to add product'
  )
}

export const updateProduct = async (productId, product) => {
  return requestJson(
    `${PRODUCTS_API_URL}/${productId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    },
    'Failed to update product'
  )
}

export const deleteProduct = async (productId) => {
  return requestJson(
    `${PRODUCTS_API_URL}/${productId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    'Failed to delete product'
  )
}
