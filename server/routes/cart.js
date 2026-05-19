const router = require('express').Router()
const Cart = require('../models/Cart')
const Medicine = require('../models/Medicine')
const { protect } = require('../middleware/auth')

// All cart routes require auth
router.use(protect)

// GET /api/cart
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    res.json(cart || { items: [] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/cart/add
router.post('/add', async (req, res) => {
  try {
    const { medicineId, qty = 1 } = req.body
    const medicine = await Medicine.findById(medicineId)
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' })
    if (!medicine.inStock) return res.status(400).json({ message: 'Out of stock' })

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) cart = new Cart({ user: req.user._id, items: [] })

    const existing = cart.items.find(i => i.medicine.toString() === medicineId)
    if (existing) {
      existing.qty += qty
    } else {
      cart.items.push({
        medicine: medicine._id,
        name: medicine.name,
        brand: medicine.brand,
        image: medicine.image,
        price: medicine.price,
        mrp: medicine.mrp,
        prescription: medicine.prescription,
        qty,
      })
    }

    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/cart/item/:medicineId
router.put('/item/:medicineId', async (req, res) => {
  try {
    const { qty } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })

    const item = cart.items.find(i => i.medicine.toString() === req.params.medicineId)
    if (!item) return res.status(404).json({ message: 'Item not in cart' })

    if (qty <= 0) {
      cart.items = cart.items.filter(i => i.medicine.toString() !== req.params.medicineId)
    } else {
      item.qty = qty
    }

    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/cart/item/:medicineId
router.delete('/item/:medicineId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ message: 'Cart not found' })
    cart.items = cart.items.filter(i => i.medicine.toString() !== req.params.medicineId)
    await cart.save()
    res.json(cart)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/cart — clear cart
router.delete('/', async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id })
    res.json({ message: 'Cart cleared' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
