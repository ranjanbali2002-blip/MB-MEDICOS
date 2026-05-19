const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  name: String,
  brand: String,
  image: String,
  price: Number,
  mrp: Number,
  prescription: Boolean,
  qty: { type: Number, default: 1, min: 1 },
}, { _id: false })

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  items: [cartItemSchema],
}, { timestamps: true })

cartSchema.virtual('subtotal').get(function () {
  return this.items.reduce((sum, i) => sum + i.price * i.qty, 0)
})

cartSchema.virtual('total').get(function () {
  const sub = this.subtotal
  const delivery = sub >= 299 ? 0 : 29
  const disc = Math.floor(sub * 0.05)
  return sub + delivery - disc
})

module.exports = mongoose.model('Cart', cartSchema)
