const mongoose = require('mongoose')

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  image: { type: String, default: '💊' },
  category: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  stock: { type: Number, default: 100 },
  minStock: { type: Number, default: 20 },
  prescription: { type: Boolean, default: false },
  description: { type: String, default: '' },
  dosage: { type: String, default: '' },
  sideEffects: { type: String, default: '' },
  manufacturer: { type: String, default: '' },
  expiry: { type: String, default: '' },
  badge: { type: String, default: null },
  sku: { type: String, unique: true },
}, { timestamps: true })

// Auto-compute discount and inStock
medicineSchema.pre('save', function (next) {
  if (this.mrp > 0) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100)
  }
  this.inStock = this.stock > 0
  next()
})

medicineSchema.index({ name: 'text', brand: 'text', category: 'text' })

module.exports = mongoose.model('Medicine', medicineSchema)
