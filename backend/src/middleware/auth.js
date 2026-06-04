import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'

const SECRET = process.env.JWT_SECRET || 'coffee_secret_change_in_prod'

// Attach user to req if valid token present
export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], SECRET)
    const user = await User.findById(payload.id).select('-password')
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

// Only allow specific roles
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' })
  }
  next()
}
