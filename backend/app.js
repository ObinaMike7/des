import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes (support both with and without the /api prefix)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/auth', authRoutes)
app.use('/products', productRoutes)

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ message: 'Server is running' })
})

export default app

