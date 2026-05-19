const mongoose = require('mongoose')

const timelineSchema = new mongoose.Schema({
  status: String,
  label: String,
  time: { type: Date, default: Date.now },
  note: String,
}, { _id: false })

const orderItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  name: String,
  brand: String,
  image: String,
  price: Number,
  mrp: Number,
  qty: { type: Number, default: 1 },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [orderItemSchema],
  subtotal: Number,
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: Number,
  address: {
    label: String,
    address: String,
  },
  paymentMethod: { type: String, enum: ['upi', 'card', 'cod', 'wallet'], default: 'upi' },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },
  prescription: { type: String, default: null },
  timeline: [timelineSchema],
  estimatedDelivery: Date,
  deliveredAt: Date,
  driverRating: { type: Number, default: null },
  driverReview: { type: String, default: '' },
}, { timestamps: true })

// Auto-generate orderId before save
orderSchema.pre('save', async function (next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderId = `MD-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`
  }
  // Add initial timeline entry
  if (this.timeline.length === 0) {
    this.timeline.push({ status: 'placed', label: 'Order Placed', time: new Date() })
  }
  next()
})

module.exports = mongoose.model('Order', orderSchema)
