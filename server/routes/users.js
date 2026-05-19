const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

router.use(protect)

// GET /api/users/profile
router.get('/profile', (req, res) => res.json(req.user.toPublic()))

// PUT /api/users/profile
router.put('/profile', [
  body('name').optional().notEmpty(),
  body('phone').optional(),
], async (req, res) => {
  try {
    const { name, phone, vehicle } = req.body
    const updates = {}
    if (name) updates.name = name
    if (phone !== undefined) updates.phone = phone
    if (vehicle && req.user.role === 'driver') updates.vehicle = vehicle

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password')
    res.json(user.toPublic())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/users/password
router.put('/password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const user = await User.findById(req.user._id)
    const ok = await user.comparePassword(req.body.currentPassword)
    if (!ok) return res.status(400).json({ message: 'Current password incorrect' })

    user.password = req.body.newPassword
    await user.save()
    res.json({ message: 'Password updated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/users/address
router.post('/address', async (req, res) => {
  try {
    const { label, address, lat, lng, isDefault } = req.body
    const user = await User.findById(req.user._id)

    if (isDefault) user.addresses.forEach(a => (a.isDefault = false))
    user.addresses.push({ label, address, lat, lng, isDefault: !!isDefault })
    await user.save()

    res.status(201).json(user.addresses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/users/address/:addrId
router.delete('/address/:addrId', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addrId)
    await user.save()
    res.json(user.addresses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/users/driver/status — driver online/offline
router.patch('/driver/status', async (req, res) => {
  if (req.user.role !== 'driver') return res.status(403).json({ message: 'Drivers only' })
  try {
    const { isOnline } = req.body
    const user = await User.findByIdAndUpdate(req.user._id, { isOnline }, { new: true }).select('-password')
    if (req.io) req.io.emit('driver_status_changed', { driverId: user._id, isOnline })
    res.json(user.toPublic())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
