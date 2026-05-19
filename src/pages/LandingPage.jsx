import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Upload, ArrowRight, Star, Shield, Clock, Package,
  CheckCircle, Smartphone, Zap, Heart, ChevronLeft, ChevronRight,
  Play, TrendingUp, Award, Headphones
} from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import SearchBar from '../components/ui/SearchBar'
import { categories, medicines, testimonials } from '../data/mockData'

function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function HeroSection({ setActiveView }) {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero dark:bg-none dark:bg-slate-900 pt-28 pb-16 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/40 dark:bg-primary-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/40 dark:bg-accent-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-400">Delivery in under 10 minutes</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                Medicine at Your
                <span className="block text-gradient">Doorstep</span>
                <span className="block">In Minutes 🚀</span>
              </h1>

              <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-lg">
                Order from 500+ trusted pharmacies near you. Upload prescriptions, track in real-time, and get genuine medicines delivered safely.
              </p>

              {/* Search Bar */}
              <SearchBar
                placeholder="Search medicines, brands, health products..."
                size="lg"
                className="mb-6 max-w-xl"
              />

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button size="xl" onClick={() => setActiveView('customer')} icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
                  Order Medicines
                </Button>
                <Button size="xl" variant="outline" icon={<Upload className="w-5 h-5" />}>
                  Upload Prescription
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: Shield, text: '100% Genuine', sub: 'Licensed pharmacies' },
                  { icon: Clock, text: '10-Min Delivery', sub: 'Express guarantee' },
                  { icon: Award, text: 'FSSAI Certified', sub: 'Govt approved' },
                ].map(({ icon: Icon, text, sub }) => (
                  <div key={text} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{text}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Illustration / Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Big hero card */}
            <div className="relative bg-gradient-to-br from-primary-500 to-accent-600 rounded-[32px] p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-white/70">Current delivery</p>
                  <h3 className="text-2xl font-black">8 Minutes 🏍️</h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
                  💊
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-white/20 rounded-full h-3 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                  className="bg-white rounded-full h-3"
                />
              </div>
              <div className="flex justify-between text-xs text-white/70 mb-6">
                <span>Pharmacy</span><span>On the way</span><span>Your door</span>
              </div>

              {/* Order details */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 space-y-2 mb-4">
                {['Paracetamol 500mg ×2', 'Vitamin D3 ×1', 'Azithromycin ×1'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-300" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-sm">RK</div>
                <div>
                  <p className="font-semibold text-sm">Raj Kumar</p>
                  <div className="flex items-center gap-1 text-xs text-yellow-300">
                    <Star className="w-3.5 h-3.5 fill-yellow-300" /> 4.9 rating
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-6 top-8 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 border border-slate-100 dark:border-slate-700"
            >
              <p className="text-xs text-slate-500 mb-1">Happy Customers</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">12,450+</p>
              <div className="flex -space-x-1 mt-2">
                {['🙂', '😊', '😄', '🥰'].map((e, i) => (
                  <span key={i} className="text-base">{e}</span>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -right-4 bottom-12 bg-white dark:bg-slate-800 rounded-2xl shadow-card p-4 border border-slate-100 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <p className="text-xs font-semibold text-slate-500">Orders Today</p>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-white">2,341</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">Shop by Category</h2>
            <p className="text-slate-500 dark:text-slate-400">Browse 500+ medicines across all health categories</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => (
            <FadeIn key={cat.id} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl cursor-pointer hover:shadow-card transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${cat.color} group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{cat.name}</p>
                  <p className="text-xs text-slate-400">{cat.count}</p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts({ setActiveView }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const featured = medicines.filter(m => m.inStock).slice(0, 6)

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">Featured Products</h2>
              <p className="text-slate-500 dark:text-slate-400">Top-selling medicines with great discounts</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}
                className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-primary-400 hover:text-primary-500 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveIdx(Math.min(featured.length - 1, activeIdx + 1))}
                className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-primary-400 hover:text-primary-500 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featured.map((med, i) => (
            <FadeIn key={med.id} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -6 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card cursor-pointer group"
                onClick={() => setActiveView('customer')}
              >
                {med.badge && (
                  <span className="text-xs font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                    {med.badge}
                  </span>
                )}
                <div className="text-4xl my-4 text-center">{med.image}</div>
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-0.5 line-clamp-1">{med.name}</p>
                <p className="text-xs text-slate-400 mb-3">{med.brand}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{med.rating}</span>
                  <span className="text-xs text-slate-400">({med.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-black text-slate-800 dark:text-white">₹{med.price}</span>
                    <span className="text-xs text-slate-400 line-through ml-1">₹{med.mrp}</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-lg">{med.discount}% off</span>
                </div>
                <Button size="sm" fullWidth className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Add to Cart
                </Button>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    { step: '01', icon: '🔍', title: 'Search & Browse', desc: 'Find your medicines by name, category, or upload your prescription for auto-fill.' },
    { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Select medicines, choose quantity, and apply offers or coupon codes.' },
    { step: '03', icon: '💳', title: 'Quick Checkout', desc: 'Pay securely with UPI, cards, or cash on delivery. Address auto-detected.' },
    { step: '04', icon: '🚴', title: 'Fast Delivery', desc: 'Your assigned delivery partner picks up and delivers in 10 minutes.' },
  ]

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">How MB-Medicos Works</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">From search to delivery in just 4 simple steps</p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 dark:from-primary-800 dark:via-primary-600 dark:to-primary-800" />

          {steps.map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/30 dark:to-accent-900/30 rounded-3xl border-2 border-primary-100 dark:border-primary-800 flex items-center justify-center text-3xl mb-4 shadow-soft z-10">
                  {s.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    { icon: Zap, title: 'Express Delivery', desc: 'Medicines at your door in as little as 10 minutes via our hyperlocal delivery network.', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { icon: Shield, title: 'Genuine Medicines', desc: 'All medicines sourced from FSSAI-licensed pharmacies. 100% authenticity guarantee.', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: Heart, title: 'Expert Guidance', desc: 'In-app pharmacist consultation for dosage advice and drug interaction checks.', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: Package, title: 'Subscription Plans', desc: 'Auto-reorder chronic medicines monthly with a 15% subscription discount.', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock customer support for emergency orders and prescription queries.', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: Smartphone, title: 'Easy App', desc: 'Reorder in 2 taps, track live, save prescriptions — all in one intuitive app.', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  ]

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">Why Choose MB-Medicos?</h2>
          <p className="text-slate-500 dark:text-slate-400">Built for every health need, every moment</p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <FadeIn key={b.title} delay={i * 0.07}>
              <Card hover animate delay={i * 0.05}>
                <div className={`w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center mb-4`}>
                  <b.icon className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-3">What Our Customers Say</h2>
          <p className="text-slate-500 dark:text-slate-400">Real stories from people who trust MB-Medicos</p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.id} delay={i * 0.1}>
              <Card hover>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function DownloadSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 rounded-[40px] p-10 md:p-16 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-64 h-64 bg-white/5 rounded-full translate-y-1/2" />

            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
                  📱 Available on iOS & Android
                </span>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Download the MB-Medicos App</h2>
                <p className="text-white/80 leading-relaxed mb-8">
                  Get even faster delivery, exclusive app-only offers, prescription auto-refills, and live tracking — all at your fingertips.
                </p>
                <div className="flex flex-wrap gap-4">
                  {['App Store', 'Google Play'].map(store => (
                    <motion.button
                      key={store}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-2xl px-5 py-3 transition-colors"
                    >
                      <span className="text-2xl">{store === 'App Store' ? '🍎' : '▶️'}</span>
                      <div className="text-left">
                        <p className="text-xs text-white/70">Download on</p>
                        <p className="font-bold text-sm">{store}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-56 h-96 bg-white/10 backdrop-blur rounded-[40px] border-2 border-white/20 shadow-2xl flex flex-col items-center justify-center p-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 text-2xl">💊</div>
                    <p className="font-black text-xl mb-1">MB-Medicos</p>
                    <p className="text-white/70 text-xs text-center mb-6">Delivering health, fast</p>
                    <div className="w-full space-y-2">
                      {['Search medicines', 'Live tracking', 'Quick checkout'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-4 h-4 text-green-300" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 -right-4 w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                  >
                    ⚡
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

export default function LandingPage({ setActiveView }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <HeroSection setActiveView={setActiveView} />
      <CategoriesSection />
      <FeaturedProducts setActiveView={setActiveView} />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialsSection />
      <DownloadSection />
    </div>
  )
}
