import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  origin:      { type: String, required: true },
  description: { type: String, required: true },
  category:    { type: String, required: true, default: 'Coffee' },
  roast:       { type: String },
  stock:       { type: Number, required: true, default: 10 },
  sold:        { type: Number, default: 0 },
  rating:      { type: Number, default: 4.5 },
  reviews:     { type: Number, default: 0 },
  image:       { type: String, required: true },
  sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true })

export const Product = mongoose.model('Product', productSchema)
