import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { authenticate } from '../middleware/auth.js'

export const authRouter = Router()
const SECRET = process.env.JWT_SECRET || 'coffee_secret_change_in_prod'

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: '7d' })
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    // Only allow buyer or seller on register — admin must be set manually in DB
    const safeRole = role === 'seller' ? 'seller' : 'buyer'
    const user = await User.create({ name, email, password: hash, role: safeRole })

    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'email and password are required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Invalid email or password' })

    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me — verify token & return current user
authRouter.get('/me', authenticate, (req, res) => {
  const u = req.user
  res.json({ id: u._id, name: u.name, email: u.email, role: u.role })
})

// DELETE /api/auth/account — delete own account
authRouter.delete('/account', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id)
    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
