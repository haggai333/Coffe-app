import { Router } from 'express'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { authenticate } from '../middleware/auth.js'

export const ordersRouter = Router()

// POST /api/orders — must be logged in
ordersRouter.post('/', authenticate, async (req, res) => {
  try {
    const { customer, items } = req.body
    if (!customer?.name || !customer?.email || !customer?.address)
      return res.status(400).json({ error: 'customer name, email, and address are required' })
    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'items must be a non-empty array' })

    const orderItems = []
    let total = 0
    for (const item of items) {
      if (!item.id || !item.qty || item.qty < 1)
        return res.status(400).json({ error: 'Each item needs id and qty >= 1' })
      const product = await Product.findById(item.id)
      if (!product) return res.status(400).json({ error: `Product ${item.id} not found` })
      if (product.stock < item.qty)
        return res.status(400).json({ error: `Not enough stock for "${product.name}". Only ${product.stock} left.` })
      orderItems.push({ productId: product._id, name: product.name, price: product.price, image: product.image, qty: item.qty })
      total += product.price * item.qty
    }

    // Deduct stock and increment sold
    for (const item of items) {
      await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.qty, sold: item.qty } })
    }

    const order = new Order({
      customer,
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      userId: req.user._id,
    })
    const saved = await order.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders — buyers see own orders, admin sees all
ordersRouter.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id }
    const orders = await Order.find(filter).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders/:id
ordersRouter.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (req.user.role !== 'admin' && String(order.userId) !== String(req.user._id))
      return res.status(403).json({ error: 'Access denied' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/orders/:id/status — admin only
ordersRouter.patch('/:id/status', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' })
    const { status } = req.body
    const valid = ['confirmed', 'shipped', 'delivered', 'cancelled']
    if (!valid.includes(status))
      return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` })
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
