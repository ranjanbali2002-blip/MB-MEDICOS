const router = require('express').Router()
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const User = require('../models/User')
const { protect, requireRole } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.use(protect)

const STATUS_LABELS = {
  placed: 'Order Placed',
  confirmed: 'Pharmacy Confirmed',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// GET /api/orders — customer sees own orders, admin/driver see all
router.get('/', async (req, res) => {
  try {
    const filter = req.user.role === 'customer' ? { customer: req.user._id } : {}
    if (req.user.role === 'driver') filter.driver = req.user._id
    const orders = await Order.find(filter)
      .populate('customer', 'name phone email')
      .populate('driver', 'name phone rating')
      .sort('-createdAt')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/orders/pending — drivers see unassigned orders
router.get('/pending', requireRole('driver', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ driver: null, status: 'confirmed' })
      .populate('customer', 'name phone')
      .sort('-createdAt')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email addresses')
      .populate('driver', 'name phone rating vehicle')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/orders — place order from cart
router.post('/', async (req, res) => {
  try {
    const { addressId, paymentMethod = 'upi', prescriptionId } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const address = req.user.addresses.id(addressId) || req.user.addresses[0]
    if (!address) return res.status(400).json({ message: 'No delivery address found' })

    const subtotal = cart.items.reduce((s, i) => s + i.price * i.qty, 0)
    const deliveryFee = subtotal >= 299 ? 0 : 29
    const discount = Math.floor(subtotal * 0.05)
    const total = subtotal + deliveryFee - discount

    const order = await Order.create({
      customer: req.user._id,
      items: cart.items.map(i => ({
        medicine: i.medicine,
        name: i.name,
        brand: i.brand,
        image: i.image,
        price: i.price,
        mrp: i.mrp,
        qty: i.qty,
      })),
      subtotal,
      deliveryFee,
      discount,
      total,
      address: { label: address.label, address: address.address },
      paymentMethod,
      prescription: prescriptionId || null,
      estimatedDelivery: new Date(Date.now() + 15 * 60 * 1000),
    })

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user._id })

    // Emit new order event via socket (attached to req)
    if (req.io) req.io.emit('new_order', order)

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/orders/:id/status — driver/admin update status
router.patch('/:id/status', requireRole('driver', 'admin'), async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.status = status
    order.timeline.push({
      status,
      label: STATUS_LABELS[status] || status,
      time: new Date(),
    })

    if (status === 'delivered') {
      order.deliveredAt = new Date()
      // Update driver stats
      if (order.driver) {
        await User.findByIdAndUpdate(order.driver, {
          $inc: { totalDeliveries: 1, totalEarnings: order.total * 0.1, todayEarnings: order.total * 0.1 },
          currentOrder: null,
        })
      }
    }

    await order.save()

    // Emit to order room
    if (req.io) {
      req.io.to(`order_${order._id}`).emit('order_updated', order)
      req.io.to(`customer_${order.customer}`).emit('order_updated', order)
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/orders/:id/assign — driver accepts order
router.patch('/:id/assign', requireRole('driver'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    if (order.driver) return res.status(400).json({ message: 'Order already assigned' })

    order.driver = req.user._id
    order.status = 'confirmed'
    order.timeline.push({ status: 'confirmed', label: STATUS_LABELS['confirmed'], time: new Date() })
    await order.save()

    await User.findByIdAndUpdate(req.user._id, { currentOrder: order._id })

    if (req.io) {
      req.io.to(`order_${order._id}`).emit('driver_assigned', { order, driver: req.user.toPublic() })
      req.io.to(`customer_${order.customer}`).emit('order_updated', order)
    }

    const populated = await Order.findById(order._id)
      .populate('driver', 'name phone rating vehicle')
    res.json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/orders/:id/rate
router.post('/:id/rate', requireRole('customer'), async (req, res) => {
  try {
    const { rating, review } = req.body
    const order = await Order.findById(req.params.id)
    if (!order || order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only rate delivered orders' })
    }

    order.driverRating = rating
    order.driverReview = review
    await order.save()

    if (order.driver) {
      const driver = await User.findById(order.driver)
      const newCount = driver.ratingCount + 1
      const newRating = (driver.rating * driver.ratingCount + rating) / newCount
      await User.findByIdAndUpdate(order.driver, { rating: newRating, ratingCount: newCount })
    }

    res.json({ message: 'Rating submitted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/orders/upload-prescription
router.post('/upload-prescription', upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const filename = req.file.filename
    await User.findByIdAndUpdate(req.user._id, {
      $push: { prescriptions: { filename, uploadedAt: new Date() } }
    })
    res.json({ filename, url: `/uploads/${filename}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
