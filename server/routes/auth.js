const router = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const { sendOtpEmail } = require('../utils/email')

const signTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

const setCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production'
  const opts = { httpOnly: true, sameSite: isProd ? 'none' : 'lax', secure: isProd }
  res.cookie('accessToken', accessToken, { ...opts, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...opts, maxAge: 7 * 24 * 60 * 60 * 1000 })
}

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('phone').notEmpty().withMessage('Phone number required')
    .matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian phone number'),
  body('role').optional().isIn(['customer', 'driver']),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg })

  try {
    const { name, email, password, phone, role = 'customer' } = req.body

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing && existing.isEmailVerified) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const otp = generateOtp()
    const hashedOtp = await bcrypt.hash(otp, 10)
    const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    if (existing && !existing.isEmailVerified) {
      // Re-send OTP to existing unverified user
      existing.emailOtp = hashedOtp
      existing.emailOtpExpiry = expiry
      await existing.save()
    } else {
      await User.create({
        name, email, password, phone, role,
        isEmailVerified: false,
        emailOtp: hashedOtp,
        emailOtpExpiry: expiry,
      })
    }

    // Send OTP email
    await sendOtpEmail(email, otp, name)

    res.status(201).json({
      needsVerification: true,
      email,
      message: 'OTP sent to your email. Please verify to continue.',
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' })

    if (!user.emailOtp || !user.emailOtpExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please register again.' })
    }
    if (new Date() > user.emailOtpExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    const isMatch = await bcrypt.compare(otp, user.emailOtp)
    if (!isMatch) return res.status(400).json({ message: 'Invalid OTP. Please try again.' })

    user.isEmailVerified = true
    user.emailOtp = undefined
    user.emailOtpExpiry = undefined
    await user.save()

    const { accessToken, refreshToken } = signTokens(user._id)
    setCookies(res, accessToken, refreshToken)
    if (accessToken) localStorage?.setItem?.('accessToken', accessToken)

    res.json({ user: user.toPublic(), accessToken, message: 'Email verified successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' })

    const otp = generateOtp()
    user.emailOtp = await bcrypt.hash(otp, 10)
    user.emailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendOtpEmail(email, otp, user.name)
    res.json({ message: 'New OTP sent to your email.' })
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

    // Block unverified users (skip check for admin)
    if (user.role !== 'admin' && !user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email first.',
        needsVerification: true,
        email: user.email,
      })
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
