import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCache } from '../context/CacheContext'
import { useNavigate } from 'react-router-dom'

const API = 'http://localhost:3001/api'
const EMPTY = { name: '', price: '', origin: '', description: '', category: 'Coffee', roast: '', stock: '', image: '' }

export default function SellerDashboard() {
  const { user, token } = useAuth()
  const { clearProductCache } = useCache()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('products')

  useEffect(() => {
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      navigate('/')
      return
    }
    fetchProducts()
  }, [user])

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/products/seller/stats`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await r.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const body = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }
    try {
      const url = editId ? `${API}/products/${editId}` : `${API}/products`
      const method = editId ? 'PUT' : 'POST'
      const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) })
      const data = await r.json()
      if (!r.ok) { setError(data.error); return }
      setSuccess(editId ? 'Product updated!' : 'Product added!')
      setForm(EMPTY); setEditId(null)
      clearProductCache()   // ← bust the home page cache
      fetchProducts()
    } catch {
      setError('Request failed')
    }
  }

  const startEdit = (p) => {
    setEditId(p._id)
    setForm({ name: p.name, price: p.price, origin: p.origin, description: p.description,
              category: p.category, roast: p.roast || '', stock: p.stock, image: p.image })
    setTab('products')
    window.scrollTo(0, 0)
  }

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return
    const r = await fetch(`${API}/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    if (r.ok) {
      clearProductCache()   // ← bust the home page cache
      fetchProducts()
    } else {
      setError('Delete failed')
    }
  }

  const totalSold = products.reduce((s, p) => s + (p.sold || 0), 0)
  const totalRevenue = products.reduce((s, p) => s + (p.sold || 0) * p.price, 0)

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>

      <div className="dash-tabs">
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>My Products</button>
        <button className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}>Stats</button>
      </div>

      {tab === 'stats' && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-value">{products.length}</div><div className="stat-label">Products Listed</div></div>
            <div className="stat-card"><div className="stat-value">{totalSold}</div><div className="stat-label">Total Units Sold</div></div>
            <div className="stat-card"><div className="stat-value">${totalRevenue.toFixed(2)}</div><div className="stat-label">Total Revenue</div></div>
          </div>
          <h3>Product Performance</h3>
          <table className="stats-table">
            <thead><tr><th>Product</th><th>Price</th><th>Stock Left</th><th>Units Sold</th><th>Revenue</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>{p.sold || 0}</td>
                  <td>${((p.sold || 0) * p.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div className="products-tab">
          <div className="product-form-card">
            <h3>{editId ? 'Edit Product' : 'Add New Product'}</h3>
            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}
            <form onSubmit={submit} className="product-form">
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input name="name" value={form.name} onChange={handle} required /></div>
                <div className="form-group"><label>Price ($) *</label><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Category *</label>
                  <select name="category" value={form.category} onChange={handle}>
                    <option>Coffee</option><option>Equipment</option><option>Accessories</option><option>Merchandise</option>
                  </select>
                </div>
                <div className="form-group"><label>Stock *</label><input name="stock" type="number" min="0" value={form.stock} onChange={handle} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Origin *</label><input name="origin" value={form.origin} onChange={handle} required /></div>
                <div className="form-group"><label>Roast Level</label><input name="roast" value={form.roast} onChange={handle} placeholder="Light / Medium / Dark" /></div>
              </div>
              <div className="form-group"><label>Image URL *</label><input name="image" value={form.image} onChange={handle} placeholder="https://..." required /></div>
              <div className="form-group"><label>Description *</label><textarea name="description" value={form.description} onChange={handle} rows="3" required /></div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">{editId ? 'Save Changes' : 'Add Product'}</button>
                {editId && <button type="button" className="btn-secondary" onClick={() => { setEditId(null); setForm(EMPTY) }}>Cancel</button>}
              </div>
            </form>
          </div>

          <h3 style={{marginTop: '2rem'}}>Your Products ({products.length})</h3>
          {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products yet. Add one above!</p> : (
            <div className="seller-products-list">
              {products.map(p => (
                <div key={p._id} className="seller-product-row">
                  <img src={p.image} alt={p.name} className="seller-product-img" />
                  <div className="seller-product-info">
                    <strong>{p.name}</strong>
                    <span>${p.price.toFixed(2)} · Stock: {p.stock} · Sold: {p.sold || 0}</span>
                  </div>
                  <div className="seller-product-actions">
                    <button className="btn-edit" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn-delete" onClick={() => deleteProduct(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
