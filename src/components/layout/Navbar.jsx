import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, ShoppingCart, Bell, MapPin, ChevronDown, LogIn, LogOut, User } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Medicines', href: '#medicines' },
  { label: 'Upload Rx', href: '#upload' },
  { label: 'Offers', href: '#offers' },
  { label: 'Track Order', href: '#track' },
]

export default function Navbar({ activeView, setActiveView, setShowAuth }) {
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(3)

  const handleLogout = async () => {
    await logout()
    setActiveView('landing')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-soft border-b border-slate-100 dark:border-slate-800'
          : 'bg-transparent'
      }`}
    >
      {/* Emergency Banner */}
      <div className="gradient-medical text-white text-center py-2 text-xs font-semibold tracking-wide">
        🚑 Emergency delivery available 24/7 — Call 1800-MB-MEDICOS &nbsp;|&nbsp; Get 20% off first order with code <span className="underline font-bold">MBFIRST20</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveView('landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-white text-lg font-black">M</span>
            </div>
            <span className="text-xl font-black text-slate-800 dark:text-white">
              MB-<span className="text-gradient">Medicos</span>
            </span>
          </motion.div>

          {/* Location pill */}
          <button className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:border-primary-300 transition-colors">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span className="font-medium">Bangalore, 560001</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 gap-1">
              {['landing', 'customer', 'driver', ...(user?.role === 'admin' ? ['admin'] : [])].map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    activeView === view
                      ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {view === 'landing' ? 'Home' : view === 'customer' ? 'Customer' : view === 'driver' ? 'Driver' : 'Admin'}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button
              className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              onClick={() => setActiveView('customer')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{user.name?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button size="sm" className="hidden md:flex" onClick={() => setShowAuth?.(true)}>
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            )}

            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <a key={link.label} href={link.href}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="grid grid-cols-4 gap-1 mt-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {['landing', 'customer', 'driver', ...(user?.role === 'admin' ? ['admin'] : [])].map(view => (
                  <button key={view} onClick={() => { setActiveView(view); setMobileOpen(false) }}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      activeView === view ? 'bg-white dark:bg-slate-700 text-primary-600' : 'text-slate-500'
                    }`}
                  >
                    {view === 'landing' ? 'Home' : view}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
