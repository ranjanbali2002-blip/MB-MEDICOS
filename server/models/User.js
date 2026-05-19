const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  address: String,
  lat: Number,
  lng: Number,
  isDefault: { type: Boolean, default: false },
})

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
  avatar: { type: String, default: '' },

  // Customer-specific
  addresses: [addressSchema],
  walletBalance: { type: Number, default: 0 },
  prescriptions: [{ filename: String, uploadedAt: Date }],

  // Driver-specific
  vehicle: { type: String, default: 'Bike' },
  isOnline: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0 },
  ratingCount: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  todayEarnings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toPublic = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
