const router = require('express').Router()
const Order = require('../models/Order')
const User = require('../models/User')
const Medicine = require('../models/Medicine')
const { protect, requireRole } = require('../middleware/auth')

// Only the designated admin account may access these routes
router.use(protect, requireRole('admin'), (req, res, next) => {
  if (req.user.username !== process.env.ADMIN_USERNAME) {
    return res.status(403).json({ message: 'Access denied' })
  }
  next()
})

// GET /api/admin/stats — dashboard KPIs
router.get('/stats', async (req, res) => {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const [
      totalOrders,
      ordersToday,
      ordersPrevDay,
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      activeDrivers,
      totalCustomers,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: new Date(startOfDay - 86400000), $lt: startOfDay } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: lastMonth, $lte: endLastMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.countDocuments({ role: 'driver', isOnline: true }),
      User.countDocuments({ role: 'customer' }),
      Medicine.countDocuments({ stock: { $gt: 0, $lte: 30 } }),
      Medicine.countDocuments({ stock: 0 }),
    ])

    const rev = totalRevenue[0]?.total || 0
    const mRev = monthRevenue[0]?.total || 0
    const lmRev = lastMonthRevenue[0]?.total || 0
    const revenueGrowth = lmRev ? (((mRev - lmRev) / lmRev) * 100).toFixed(1) : 0

    res.json({
      totalRevenue: rev,
      revenueFormatted: rev >= 100000 ? `₹${(rev / 100000).toFixed(1)}L` : `₹${(rev / 1000).toFixed(1)}k`,
      revenueGrowth: `+${revenueGrowth}%`,
      ordersToday,
      ordersTodayGrowth: ordersToday - ordersPrevDay,
      activeDrivers,
      totalCustomers,
      totalOrders,
      lowStockCount,
      outOfStockCount,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/revenue-chart — last 6 months
router.get('/revenue-chart', async (req, res) => {
  try {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({ year: d.getFullYear(), month: d.getMonth() })
    }

    const data = await Promise.all(months.map(async ({ year, month }) => {
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 0, 23, 59, 59)
      const [agg, count] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        ]),
        Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      ])
      return {
        month: start.toLocaleString('default', { month: 'short' }),
        revenue: agg[0]?.revenue || 0,
        orders: count,
        target: Math.round((agg[0]?.revenue || 50000) * 1.1),
      }
    }))

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/orders — all orders with pagination
router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const filter = status ? { status } : {}
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name phone email')
        .populate('driver', 'name phone')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ])
    res.json({ orders, total, page: parseInt(page) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/drivers
router.get('/drivers', async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password').sort('-totalDeliveries')
    res.json(drivers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/drivers/:id/verify
router.patch('/drivers/:id/verify', async (req, res) => {
  try {
    const driver = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    ).select('-password')
    res.json(driver)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/orders/:id/assign
router.patch('/orders/:id/assign', async (req, res) => {
  try {
    const { driverId } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        driver: driverId,
        status: 'confirmed',
        $push: { timeline: { status: 'confirmed', label: 'Pharmacy Confirmed', time: new Date() } }
      },
      { new: true }
    ).populate('driver', 'name phone rating')

    if (req.io) req.io.to(`order_${order._id}`).emit('order_updated', order)
    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
