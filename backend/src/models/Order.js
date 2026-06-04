import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  image:     { type: String },
  qty:       { type: Number, required: true, min: 1 },
})

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    address: { type: String, required: true },
  },
  items:  [orderItemSchema],
  total:  { type: Number, required: true },
  status: {
    type: String,
    enum: ['confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed',
  },
}, { timestamps: true })

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) this.orderNumber = `ORD-${Date.now()}`
  next()
})

orderSchema.virtual('date').get(function () {
  return this.createdAt?.toLocaleString()
})
orderSchema.set('toJSON', { virtuals: true })

export const Order = mongoose.model('Order', orderSchema)
