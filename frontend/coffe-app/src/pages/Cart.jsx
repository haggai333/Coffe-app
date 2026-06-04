import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { cart, removeFromCart, updateQty, total, itemCount } = useCart()

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">
          <img src="/icons/cart.svg" alt="Empty cart" width="64" height="64" />
        </div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items yet.</p>
        <Link to="/" className="btn-primary">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart <span className="cart-count-label">({itemCount} items)</span></h1>
      <div className="cart-content">

        <div className="cart-items">
          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                <p className="cart-item-price">${item.price.toFixed(2)} each</p>
              </div>
              <div className="cart-item-right">
                <div className="quantity-control">
                  <button onClick={() => updateQty(item.id, item.qty - 1)} className="qty-btn">
                    <img src="/icons/minus.svg" alt="decrease" width="16" height="16" />
                  </button>
                  <span className="qty-value">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} className="qty-btn">
                    <img src="/icons/plus.svg" alt="increase" width="16" height="16" />
                  </button>
                </div>
                <div className="cart-item-total">${(item.price * item.qty).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.id)} className="remove-btn">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: '#28a745', fontWeight: 600 }}>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn-checkout">Proceed to Checkout</Link>
          <Link to="/" className="btn-continue">Continue Shopping</Link>
        </div>

      </div>
    </div>
  )
}
