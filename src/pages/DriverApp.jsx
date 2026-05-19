import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Navigation, Wallet, Star, Bell, Settings,
  TrendingUp, Package, Clock, CheckCircle, MapPin, Phone,
  ChevronRight, ToggleLeft, ToggleRight, ArrowUp, Zap
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { weeklyEarnings } from '../data/mockData'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { ordersApi, usersApi } from '../services/api'
import { useToast } from '../components/ui/Toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-card text-xs">
        <p className="font-bold text-slate-800 dark:text-white">{label}</p>
        <p className="text-primary-500">₹{payload[0].value}</p>
      </div>
    )
  }
  return null
}

const deliveryRequests = [
  { id: 'DR-001', pickup: 'MedPlus, Indiranagar', drop: '12, 5th Cross, HSR Layout', distance: '3.2 km', items: 3, amount: 180, eta: '12 min', urgent: true },
  { id: 'DR-002', pickup: 'Apollo Pharmacy, Koramangala', drop: '45, 2nd Main, Koramangala', distance: '1.8 km', items: 1, amount: 89, eta: '8 min', urgent: false },
]

// ─── OVERVIEW DASHBOARD ────────────────────────────────────────────────────────
function OverviewTab({ isOnline, setIsOnline, toggleOnline }) {
  const { isDark } = useTheme()
  const stats = [
    { label: "Today's Earnings", value: '₹1,240', icon: Wallet, trend: '+18%', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Deliveries', value: '14', icon: Package, trend: '+3 today', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Online Hours', value: '6.5h', icon: Clock, trend: 'Today', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Rating', value: '4.9', icon: Star, trend: '↑ from 4.8', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  ]

  return (
    <div className="space-y-5">
      {/* Online Toggle */}
      <motion.div
        animate={{ borderColor: isOnline ? '#10B981' : '#94A3B8' }}
        className={`relative overflow-hidden rounded-3xl p-6 border-2 transition-all duration-300 ${
          isOnline
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 border-primary-500'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${isOnline ? 'text-white/80' : 'text-slate-500'}`}>Driver Status</p>
            <h2 className={`text-2xl font-black ${isOnline ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
              {isOnline ? '🟢 Online' : '⚫ Offline'}
            </h2>
            <p className={`text-xs mt-1 ${isOnline ? 'text-white/70' : 'text-slate-400'}`}>
              {isOnline ? 'You are receiving delivery requests' : 'Go online to start earning'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleOnline ? toggleOnline() : setIsOnline(!isOnline)}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${
              isOnline ? 'bg-white/20 backdrop-blur' : 'bg-primary-500'
            }`}
          >
            {isOnline ? '⏸️' : '▶️'}
          </motion.button>
        </div>
        {isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 bg-white/15 rounded-2xl px-3 py-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">2 delivery requests nearby</span>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-soft"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-2xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="text-xs text-primary-500 font-semibold mt-0.5">{s.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Earnings Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">Weekly Earnings</h3>
            <p className="text-xs text-slate-400">This week · ₹13,330 total</p>
          </div>
          <Badge variant="green">+22% vs last week</Badge>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyEarnings} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#f1f5f9'} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#94A3B8' : '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1E293B' : '#f0fdf4', radius: 8 }} />
            <Bar dataKey="earnings" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Wallet Summary */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-3xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Wallet Balance</p>
            <p className="text-3xl font-black">₹3,420</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button size="sm" className="flex-1 bg-white/20 hover:bg-white/30 text-white shadow-none backdrop-blur">Withdraw</Button>
          <Button size="sm" className="flex-1 bg-white/20 hover:bg-white/30 text-white shadow-none backdrop-blur">History</Button>
        </div>
      </div>
    </div>
  )
}

// ─── DELIVERY REQUESTS ─────────────────────────────────────────────────────────
function DeliveriesTab() {
  const [accepted, setAccepted] = useState(null)
  const addToast = useToast()
  const qc = useQueryClient()
  const { data: pendingOrders = [] } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: () => ordersApi.getPending().then(r => r.data),
    refetchInterval: 15000,
  })

  const acceptOrder = async (order) => {
    try {
      const { data } = await ordersApi.assign(order._id)
      setAccepted(data)
      qc.invalidateQueries({ queryKey: ['pending-orders'] })
      addToast({ message: 'Order accepted!', type: 'success' })
    } catch (err) {
      addToast({ message: err.response?.data?.message || 'Failed to accept', type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-slate-800 dark:text-white">Delivery Requests</h2>
        <Badge variant="blue" dot>{pendingOrders.length} nearby</Badge>
      </div>

      {/* Active delivery */}
      {accepted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-5 text-white"
        >
          <p className="text-white/70 text-xs font-semibold mb-1">ACTIVE DELIVERY</p>
          <h3 className="font-black text-lg mb-3">{accepted.orderId}</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">📍</div>
              <span className="text-white/80">Pickup: MB-Medicos Pharmacy</span>
            </div>
            <div className="w-0.5 h-3 bg-white/30 ml-2.5" />
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs">🏠</div>
              <span className="text-white/80">{accepted.address?.address || 'Customer address'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button size="sm" className="flex-1 bg-white text-primary-600 hover:bg-white/90 shadow-none">Navigate</Button>
            <Button size="sm" className="flex-1 bg-white/20 text-white hover:bg-white/30 shadow-none" onClick={async () => { try { await ordersApi.updateStatus(accepted._id, 'delivered'); setAccepted(null); addToast({ message: 'Order marked delivered!', type: 'success' }) } catch {} }}>Mark Delivered</Button>
          </div>
        </motion.div>
      )}

      {pendingOrders.filter(o => !accepted || o._id !== accepted._id).map((req, i) => (
        <motion.div
          key={req._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <Card padding={false}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{req.orderId}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="green">₹{req.total}</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-200 text-xs">Pickup: MB-Medicos Pharmacy</span>
                </div>
                <div className="w-0.5 h-2 bg-slate-200 dark:bg-slate-700 ml-2" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-500 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-200 text-xs">{req.address?.address || 'Customer address'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{req.items?.length || 0} items</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />~15 min</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" fullWidth onClick={() => addToast({ message: 'Order declined', type: 'info' })}>Decline</Button>
                <Button size="sm" fullWidth onClick={() => acceptOrder(req)}>Accept</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      {pendingOrders.length === 0 && !accepted && (
        <div className="text-center py-16 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No requests right now</p>
          <p className="text-sm">Go online to receive delivery requests</p>
        </div>
      )}
    </div>
  )
}

// ─── RATINGS TAB ───────────────────────────────────────────────────────────────
function RatingsTab() {
  const reviews = [
    { customer: 'AK', text: 'Super fast delivery! Medicines arrived in 9 mins.', rating: 5, time: '2h ago' },
    { customer: 'VP', text: 'Polite and professional. Handed over with care.', rating: 5, time: '5h ago' },
    { customer: 'SM', text: 'On time, well-packaged. Thank you!', rating: 4, time: 'Yesterday' },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-black text-slate-800 dark:text-white">4.9</p>
            <div className="flex gap-0.5 mt-1 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1">1,243 ratings</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(n => (
              <div key={n} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-3">{n}</span>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 rounded-full h-2 transition-all"
                    style={{ width: n === 5 ? '82%' : n === 4 ? '14%' : n === 3 ? '3%' : '1%' }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-8">{n === 5 ? '82%' : n === 4 ? '14%' : n === 3 ? '3%' : '1%'}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <h3 className="font-bold text-slate-800 dark:text-white px-1">Recent Reviews</h3>
      {reviews.map((r, i) => (
        <Card key={i}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">{r.customer}</div>
            <div className="flex-1">
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs text-slate-400">{r.time}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{r.text}</p>
        </Card>
      ))}
    </div>
  )
}

// ─── MAIN DRIVER APP ───────────────────────────────────────────────────────────
export default function DriverApp() {
  const [activeTab, setActiveTab] = useState('overview')
  const { user, refetch } = useAuth()
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true)
  const qc = useQueryClient()
  const addToast = useToast()

  const toggleOnline = async () => {
    try {
      await usersApi.setDriverStatus(!isOnline)
      setIsOnline(o => !o)
      await refetch()
    } catch {
      addToast({ message: 'Failed to update status', type: 'error' })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deliveries', label: 'Requests', icon: Navigation },
    { id: 'ratings', label: 'Ratings', icon: Star },
  ]

  const renderTab = () => {
    if (activeTab === 'deliveries') return <DeliveriesTab />
    if (activeTab === 'ratings') return <RatingsTab />
    return <OverviewTab isOnline={isOnline} setIsOnline={setIsOnline} toggleOnline={toggleOnline} />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen relative shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 pt-5 pb-4 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs">Delivery Partner</p>
            <h1 className="text-white font-black text-lg">{user?.name || 'Driver'} 🏍️</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-white" />
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-primary-500 border-primary-500'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
