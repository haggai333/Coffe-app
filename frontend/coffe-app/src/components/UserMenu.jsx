import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserMenu() {
  const { user, logout, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) {
    return (
      <button className="btn-login-nav" onClick={() => navigate('/auth')}>
        <img src="/icons/user.svg" alt="user" width="20" height="20" />
        Sign In
      </button>
    )
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return
    try { await deleteAccount(); navigate('/') }
    catch (e) { alert(e.message) }
  }

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="user-menu-btn" onClick={() => setOpen(o => !o)}>
        <div className="user-avatar">{user.name[0].toUpperCase()}</div>
        <span className="user-name-nav">{user.name}</span>
        <span className="user-role-badge">{user.role}</span>
      </button>
      {open && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          {(user.role === 'seller' || user.role === 'admin') && (
            <button onClick={() => { navigate('/seller'); setOpen(false) }}>Dashboard</button>
          )}
          <button onClick={() => { navigate('/orders'); setOpen(false) }}>My Orders</button>
          <button onClick={() => { logout(); setOpen(false) }}>Sign Out</button>
          <button className="delete-account-btn" onClick={handleDelete}>Delete Account</button>
        </div>
      )}
    </div>
  )
}
