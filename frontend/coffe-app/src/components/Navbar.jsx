import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import UserMenu from './UserMenu'

export default function Navbar() {
  const { itemCount } = useCart()
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/icons/coffee.svg" alt="coffee" width="24" height="24" style={{verticalAlign:'middle', marginRight:'6px', filter:'invert(1)'}} />
          Coffee Shop
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/orders" className="nav-link">Orders</Link>
          <Link to="/cart" className="nav-link cart-nav-link">
            <img src="/icons/cart.svg" alt="cart" width="20" height="20" style={{verticalAlign:'middle', filter:'invert(1)'}} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}
