const router = require('express').Router()
const Medicine = require('../models/Medicine')
const { protect, requireRole } = require('../middleware/auth')

// GET /api/medicines — public, with search + filter + pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, inStock, prescription, sort = '-createdAt', page = 1, limit = 20 } = req.query
    const filter = {}

    if (search) filter.$text = { $search: search }
    if (category && category !== 'All') filter.category = category
    if (inStock === 'true') filter.inStock = true
    if (prescription === 'true') filter.prescription = true
    if (prescription === 'false') filter.prescription = false

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [medicines, total] = await Promise.all([
      Medicine.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Medicine.countDocuments(filter),
    ])

    res.json({ medicines, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/medicines/categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Medicine.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    res.json(cats.map(c => ({ name: c._id, count: c.count })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/medicines/:id
router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id)
    if (!med) return res.status(404).json({ message: 'Medicine not found' })
    res.json(med)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/medicines — admin only
router.post('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const med = await Medicine.create(req.body)
    res.status(201).json(med)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/medicines/:id — admin only
router.put('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!med) return res.status(404).json({ message: 'Medicine not found' })
    res.json(med)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/medicines/:id — admin only
router.delete('/:id', protect, requireRole('admin'), async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id)
    res.json({ message: 'Medicine deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
