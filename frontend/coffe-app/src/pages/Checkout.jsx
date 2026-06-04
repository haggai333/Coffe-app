import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { ordersAPI } from '../services/api'

export default function Checkout() {
  const { cart, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', address: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  if (!user) {
    return (
      <div className="auth-required">
        <h2>Sign in to checkout</h2>
        <p>You need an account to place an order.</p>
        <Link to="/auth" className="btn-primary">Sign In / Register</Link>
      </div>
    )
  }

  if (cart.length === 0 && !orderComplete) { navigate('/cart'); return null }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email is required'
    if (!form.address.trim()) e.address = 'Address is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await ordersAPI.place({ customer: form, items: cart.map(item => ({ id: item._id || item.id, qty: item.qty })) })
      clearCart()
      setOrderComplete(true)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  if (orderComplete) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-icon">
          <img src="/icons/check.svg" alt="confirmed" width="48" height="48" style={{filter:'invert(1)'}} />
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you, {form.name}! Your order has been placed.</p>
        <div className="confirmation-actions">
          <Link to="/orders" className="btn-primary">View Orders</Link>
          <Link to="/" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h3>Shipping Information</h3>
          {errors.submit && <div className="error-banner">⚠️ {errors.submit}</div>}
          <div className="form-group">
            <label>Full Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className={errors.name ? 'error' : ''} />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={errors.email ? 'error' : ''} />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Delivery Address *</label>
            <textarea name="address" value={form.address} onChange={handleChange} className={errors.address ? 'error' : ''} rows="3" />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>
        </form>
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item._id || item.id} className="summary-item">
                <span>{item.name} x{item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button onClick={handleSubmit} className="btn-place-order" disabled={submitting}>
            {submitting ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
