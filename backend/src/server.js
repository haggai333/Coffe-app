import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { productsRouter } from './routes/product.js'
import { ordersRouter } from './routes/orders.js'
import { authRouter } from './routes/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)

app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`)
  })
}
startServer()
