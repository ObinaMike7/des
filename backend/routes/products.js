import express from 'express'
import { productsPool as pool } from '../db.js'

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({ error: 'Server error fetching products' })
  }
})

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({ error: 'Server error fetching product' })
  }
})

// Add new product
router.post('/', async (req, res) => {
  try {
    const { item_number, name, description, quantity, price, category_id } = req.body
    const normalizedItemNumber = item_number?.trim()
    const normalizedName = name?.trim()
    const parsedQuantity = Number.parseInt(quantity, 10)
    const parsedPrice = price === null || price === undefined || price === '' ? null : Number.parseFloat(price)

    // Validation
    if (!normalizedItemNumber || !normalizedName || Number.isNaN(parsedQuantity)) {
      return res.status(400).json({ error: 'Please provide item_number, name, and quantity' })
    }

    if (parsedQuantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' })
    }

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Please provide a valid price' })
    }

    // Check if item_number already exists
    const existingProduct = await pool.query(
      'SELECT * FROM products WHERE item_number = $1',
      [normalizedItemNumber]
    )

    if (existingProduct.rows.length > 0) {
      return res.status(409).json({ error: 'Product with this item number already exists' })
    }

    // Insert product
    const result = await pool.query(
      'INSERT INTO products (item_number, name, description, quantity, price, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [normalizedItemNumber, normalizedName, description?.trim() || null, parsedQuantity, parsedPrice, category_id || null]
    )

    res.status(201).json({
      message: 'Product added successfully',
      product: result.rows[0],
    })
  } catch (error) {
    console.error('Add product error:', error)
    res.status(500).json({ error: 'Server error adding product' })
  }
})

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, quantity, price, category_id } = req.body
    const normalizedName = name?.trim()
    const parsedQuantity = Number.parseInt(quantity, 10)
    const parsedPrice = price === null || price === undefined || price === '' ? null : Number.parseFloat(price)

    if (!normalizedName || Number.isNaN(parsedQuantity)) {
      return res.status(400).json({ error: 'Please provide name and quantity' })
    }

    if (parsedQuantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' })
    }

    if (parsedPrice !== null && Number.isNaN(parsedPrice)) {
      return res.status(400).json({ error: 'Please provide a valid price' })
    }

    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, quantity = $3, price = $4, category_id = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [normalizedName, description?.trim() || null, parsedQuantity, parsedPrice, category_id || null, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0],
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({ error: 'Server error updating product' })
  }
})

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      message: 'Product deleted successfully',
      product: result.rows[0],
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({ error: 'Server error deleting product' })
  }
})

export default router
