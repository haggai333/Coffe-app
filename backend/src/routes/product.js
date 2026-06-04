import { Router } from 'express'
import { Product } from '../models/Product.js'
import { authenticate, requireRole } from '../middleware/auth.js'

export const productsRouter = Router()

// GET /api/products/seller/stats — MUST be before /:id
productsRouter.get('/seller/stats', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'seller' ? { sellerId: req.user._id } : {}
    const products = await Product.find(filter)
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/products — public
productsRouter.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query
    const filter = {}
    if (category && category !== 'All') filter.category = category
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { origin: { $regex: search, $options: 'i' } },
    ]
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }
    let sortObj = {}
    if (sort === 'price-asc')  sortObj = { price: 1 }
    if (sort === 'price-desc') sortObj = { price: -1 }
    if (sort === 'rating')     sortObj = { rating: -1 }
    if (sort === 'name')       sortObj = { name: 1 }

    const products = await Product.find(filter).sort(sortObj)
    const allCategories = await Product.distinct('category')
    res.json({ products, total: products.length, categories: ['All', ...allCategories] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/products/:id — public
productsRouter.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/products — seller or admin only
productsRouter.post('/', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.create({ ...req.body, sellerId: req.user._id })
    res.status(201).json(product)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/products/:id — seller (own) or admin
productsRouter.put('/:id', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    if (req.user.role === 'seller' && String(product.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only edit your own products' })
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/products/:id — seller (own) or admin
productsRouter.delete('/:id', authenticate, requireRole('seller', 'admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ error: 'Product not found' })
    if (req.user.role === 'seller' && String(product.sellerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You can only delete your own products' })
    }
    await product.deleteOne()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
