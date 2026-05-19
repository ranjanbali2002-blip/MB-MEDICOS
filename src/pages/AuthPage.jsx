import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ShoppingBag, AtSign, KeyRound, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import { authApi } from '../services/api'

const roles = [
  { id: 'customer', label: 'Customer', emoji: '🛒', desc: 'Order medicines' },
  { id: 'driver', label: 'Driver', emoji: '🏍️', desc: 'Deliver orders' },
]

export default function AuthPage({ onSuccess }) {
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', identifier: '', email: '', password: '', phone: '', role: 'customer' })

  // OTP verification state
  const [verifyMode, setVerifyMode] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { login, register } = useAuth()
  const addToast = useToast()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Start resend cooldown timer
  const startCooldown = () => {
    setResendCooldown(30)
    const t = setInterval(() => {
      setResendCooldown(c => {
        if (c <= 1) { clearInterval(t); return 0 }
        return c - 1
      })
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const user = await login(form.identifier, form.password)
        addToast({ message: `Welcome back, ${user.name?.split(' ')[0]}! 👋`, type: 'success' })
        onSuccess(user)
      } else {
        // Register → backend sends OTP
        const { data } = await authApi.register({
          name: form.name,
          email: form.identifier,
          password: form.password,
          phone: form.phone,
          role: form.role,
        })
        if (data.needsVerification) {
          setVerifyEmail(data.email)
          setVerifyMode(true)
          startCooldown()
          addToast({ message: 'OTP sent to your email! Check inbox 📧', type: 'success' })
        }
      }
    } catch (err) {
      const errData = err.response?.data
      // If login blocked due to unverified email
      if (errData?.needsVerification) {
        setVerifyEmail(errData.email)
        setVerifyMode(true)
        addToast({ message: 'Please verify your email first', type: 'warning' })
        return
      }
      addToast({ message: errData?.message || 'Something went wrong', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      addToast({ message: 'Enter the 6-digit OTP', type: 'error' })
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.verifyEmail(verifyEmail, otp)
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
      addToast({ message: 'Email verified! Welcome to MB-Medicos 🎉', type: 'success' })
      onSuccess(data.user)
    } catch (err) {
      addToast({ message: err.response?.data?.message || 'Invalid OTP', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setResendLoading(true)
    try {
      await authApi.resendOtp(verifyEmail)
      addToast({ message: 'New OTP sent to your email! 📧', type: 'success' })
      startCooldown()
    } catch (err) {
      addToast({ message: err.response?.data?.message || 'Failed to resend OTP', type: 'error' })
    } finally {
      setResendLoading(false)
    }
  }

  const demoLogin = async (identifier, password) => {
    setLoading(true)
    try {
      const user = await login(identifier, password)
      addToast({ message: `Logged in as ${user.name}`, type: 'success' })
      onSuccess(user)
    } catch {
      addToast({ message: 'Demo login failed', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // ── OTP Verification Screen ─────────────────────────────────────────────────
  if (verifyMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">MB-Medicos</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2">Verify Your Email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We sent a 6-digit OTP to<br />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{verifyEmail}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 transition-all"
                  required
                />
                <p className="text-xs text-slate-400 text-center mt-2">Check your inbox and spam folder</p>
              </div>

              <motion.button
                type="submit"
                disabled={loading || otp.length !== 6}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-glow hover:shadow-glow transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Verify & Continue
              </motion.button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resendLoading}
                className="flex items-center gap-2 mx-auto text-sm text-primary-500 hover:text-primary-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>

            <button
              onClick={() => { setVerifyMode(false); setOtp('') }}
              className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to Sign Up
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Login / Register Screen ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">MB-Medicos</span>
          </motion.div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {mode === 'login' ? 'Welcome back — sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-card p-8">
          {/* Tab switch */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-2xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                  mode === m
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-soft'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Field icon={<User className="w-4 h-4" />} placeholder="Full name" value={form.name} onChange={v => set('name', v)} required />
                  <Field icon={<Phone className="w-4 h-4" />} placeholder="10-digit phone number" value={form.phone} onChange={v => set('phone', v)} type="tel" required />

                  {/* Role selector */}
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map(r => (
                      <motion.button
                        key={r.id}
                        type="button"
                        onClick={() => set('role', r.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${
                          form.role === r.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <div className="text-xl mb-1">{r.emoji}</div>
                        <div className="font-semibold text-sm text-slate-800 dark:text-white">{r.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              icon={<AtSign className="w-4 h-4" />}
              placeholder={mode === 'login' ? 'Email or Username' : 'Email address'}
              value={form.identifier}
              onChange={v => set('identifier', v)}
              type={mode === 'register' ? 'email' : 'text'}
              required
            />

            {/* Password field */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm shadow-glow hover:shadow-glow transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

        </div>
      </motion.div>
    </div>
  )
}

function Field({ icon, placeholder, value, onChange, type = 'text', required }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
      />
    </div>
  )
}
