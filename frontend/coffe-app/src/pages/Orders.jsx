import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../services/api'

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    ordersAPI.getAll()
      .then(setOrders)
      .catch(err => console.error('Failed to load orders:', err))
  }, [])

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <div className="empty-icon">
          <img src="/icons/orders.svg" alt="No orders" width="64" height="64" />
        </div>
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders. Start shopping to see your orders here!</p>
        <Link to="/" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="orders-container">
      <h1>Order History</h1>
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <span className="order-number">{order.orderNumber || `Order #${order.id}`}</span>
                <span className="order-date">{order.date}</span>
              </div>
              <span className="order-total">${order.total.toFixed(2)}</span>
            </div>
            <div className="order-customer">
              <p><strong>Customer:</strong> {order.customer?.name}</p>
              <p><strong>Email:</strong> {order.customer?.email}</p>
              <p><strong>Address:</strong> {order.customer?.address}</p>
            </div>
            <div className="order-items">
              <h4>Items</h4>
              <table className="items-table">
                <thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="item-info">
                          <img src={item.image} alt={item.name} className="item-thumb" />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>{item.qty}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
