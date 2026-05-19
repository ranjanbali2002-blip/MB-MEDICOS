const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

const signTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

const setCookies = (res, accessToken, refreshToken) => {
  const opts = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' }
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').optional().isIn(['customer', 'driver']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { name, email, password, phone, role = 'customer' } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const user = await User.create({ name, email, password, phone, role })
    const { accessToken, refreshToken } = signTokens(user._id)
    setCookies(res, accessToken, refreshToken)

    res.status(201).json({ user: user.toPublic(), accessToken })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login — accepts email or username
router.post('/login', [
  body('identifier').notEmpty().withMessage('Username or email required'),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  try {
    const { identifier, password } = req.body
    const isEmail = identifier.includes('@')
    const user = await User.findOne(isEmail ? { email: identifier.toLowerCase() } : { username: identifier })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Admin access is restricted to the dedicated admin account only
    if (user.role === 'admin' && user.username !== process.env.ADMIN_USERNAME) {
      return res.status(403).json({ message: 'Access denied' })
    }

    const { accessToken, refreshToken } = signTokens(user._id)
    setCookies(res, accessToken, refreshToken)

    res.json({ user: user.toPublic(), accessToken })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return res.status(401).json({ message: 'No refresh token' })

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })

    const { accessToken, refreshToken } = signTokens(user._id)
    setCookies(res, accessToken, refreshToken)
    res.json({ user: user.toPublic(), accessToken })
  } catch (err) {
    res.status(401).json({ message: 'Refresh token invalid' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out' })
})

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toPublic() })
})

module.exports = router
