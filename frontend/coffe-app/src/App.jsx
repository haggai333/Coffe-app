import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { CacheProvider } from './context/CacheContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AuthPage from './pages/AuthPage'
import SellerDashboard from './pages/SellerDashboard'
import './App.css'

function App() {
  return (
    <CacheProvider>
      <CartProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </CartProvider>
    </CacheProvider>
  )
}

export default App
