import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Package, Truck, Users, ShoppingBag,
  Plus, Edit, Trash2, AlertTriangle, CheckCircle, Clock, Search,
  Filter, Download, MoreVertical, Eye, Bell, Sun, Moon, ChevronUp,
  RefreshCw, XCircle, Loader2
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Sidebar from '../components/layout/Sidebar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { StatCardSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { useTheme } from '../contexts/ThemeContext'
import { adminApi, medicinesApi } from '../services/api'
import { inventoryData } from '../data/mockData'

function useAdminStats() {
  return useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats().then(r => r.data), staleTime: 30000 })
}
function useRevenueChart() {
  return useQuery({ queryKey: ['revenue-chart'], queryFn: () => adminApi.getRevenueChart().then(r => r.data), staleTime: 60000 })
}
function useAdminOrders(params) {
  return useQuery({ queryKey: ['admin-orders', params], queryFn: () => adminApi.getOrders(params).then(r => r.data), staleTime: 15000 })
}
function useAdminDrivers() {
  return useQuery({ queryKey: ['admin-drivers'], queryFn: () => adminApi.getDrivers().then(r => r.data), staleTime: 30000 })
}
function useAdminMedicines() {
  return useQuery({ queryKey: ['admin-medicines'], queryFn: () => medicinesApi.getAll({ limit: 50 }).then(r => r.data), staleTime: 30000 })
}

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (active && payload?.length) return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-card text-xs">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') ? `₹${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  )
  return null
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, growth, icon: Icon, iconColor, iconBg, positive = true, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
          positive ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'
        }`}>
          {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {growth}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-800 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  )
}

// ─── DASHBOARD TAB ─────────────────────────────────────────────────────────────
function DashboardTab() {
  const { isDark } = useTheme()
  const gridColor = isDark ? '#334155' : '#f1f5f9'
  const textColor = isDark ? '#94A3B8' : '#64748B'
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: chartData = [] } = useRevenueChart()

  const pieData = [
    { name: 'Vitamins', value: 35 },
    { name: 'Pain Relief', value: 25 },
    { name: 'Antibiotics', value: 20 },
    { name: 'Diabetes', value: 12 },
    { name: 'Others', value: 8 },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statsLoading ? (
          [0,1,2,3].map(i => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Revenue" value={stats?.revenueFormatted || '₹0'} growth={stats?.revenueGrowth || '+0%'} icon={TrendingUp} iconColor="text-green-500" iconBg="bg-green-50 dark:bg-green-900/20" delay={0} />
            <StatCard label="Orders Today" value={stats?.ordersToday ?? 0} growth={`${stats?.ordersTodayGrowth >= 0 ? '+' : ''}${stats?.ordersTodayGrowth ?? 0}`} icon={ShoppingBag} iconColor="text-blue-500" iconBg="bg-blue-50 dark:bg-blue-900/20" delay={0.05} />
            <StatCard label="Active Drivers" value={stats?.activeDrivers ?? 0} growth="Live" icon={Truck} iconColor="text-purple-500" iconBg="bg-purple-50 dark:bg-purple-900/20" delay={0.1} />
            <StatCard label="Customers" value={(stats?.totalCustomers ?? 0).toLocaleString()} growth={`${stats?.totalOrders ?? 0} orders`} icon={Users} iconColor="text-orange-500" iconBg="bg-orange-50 dark:bg-orange-900/20" delay={0.15} />
          </>
        )}
      </div>

      {/* Revenue Chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Revenue Analytics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="green">+18% MoM</Badge>
              <button className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Download className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#revenueGrad)" name="Revenue" dot={{ r: 4, fill: '#10B981' }} />
              <Area type="monotone" dataKey="target" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" fill="url(#targetGrad)" name="Target" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-slate-600 dark:text-slate-300">{d.name}</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Orders Chart + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800 dark:text-white">Order Volume</h3>
            <Badge variant="blue">This Month</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Bar dataKey="orders" fill="url(#orderBarGrad)" radius={[6, 6, 0, 0]} name="Orders" />
              <defs>
                <linearGradient id="orderBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding={false}>
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Orders</h3>
            <button className="text-xs text-primary-500 font-semibold">View all</button>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {orders.map(order => (
              <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  order.status === 'Delivered' ? 'bg-green-50 dark:bg-green-900/20' :
                  order.status === 'Out for Delivery' ? 'bg-blue-50 dark:bg-blue-900/20' :
                  'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  {order.status === 'Delivered' ? <CheckCircle className="w-4 h-4 text-green-500" /> :
                   order.status === 'Out for Delivery' ? <Truck className="w-4 h-4 text-blue-500" /> :
                   <Clock className="w-4 h-4 text-yellow-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{order.id}</p>
                  <p className="text-xs text-slate-400 truncate">{order.items.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">₹{order.total}</p>
                  <Badge variant={order.status === 'Delivered' ? 'green' : order.status === 'Out for Delivery' ? 'blue' : 'yellow'} className="text-[10px]">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── INVENTORY TAB ─────────────────────────────────────────────────────────────
function InventoryTab() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const toast = useToast()
  const qc = useQueryClient()
  const { data: medsData, isLoading } = useAdminMedicines()
  const allMeds = medsData?.medicines || inventoryData
  const filtered = allMeds.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const statusStyle = {
    'In Stock': { badge: 'green', bar: 'bg-green-400' },
    'Low Stock': { badge: 'yellow', bar: 'bg-yellow-400' },
    'Out of Stock': { badge: 'red', bar: 'bg-red-400' },
  }

  return (
    <div className="space-y-5">
      {/* Low Stock Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl px-4 py-3"
      >
        <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
        <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
          2 medicines are running low on stock. <span className="underline cursor-pointer font-bold">Reorder now</span>
        </p>
      </motion.div>

      {/* Top Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search inventory..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-primary-400 text-slate-800 dark:text-slate-200 transition-colors"
          />
        </div>
        <Button icon={<Filter className="w-4 h-4" />} variant="outline" size="md">Filter</Button>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>Add Medicine</Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                {['Medicine', 'SKU', 'Category', 'Stock', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.map((item, i) => {
                const style = statusStyle[item.status]
                const pct = Math.min(100, Math.round((item.stock / (item.minStock * 5)) * 100))
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-sm text-slate-800 dark:text-white">{item.name}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg">{item.sku}</code>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.category}</td>
                    <td className="px-4 py-3.5 min-w-32">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : item.stock < item.minStock ? 'text-yellow-500' : 'text-slate-800 dark:text-white'}`}>{item.stock}</span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200">₹{item.price}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={style.badge}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-xl text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast({ message: `${item.name} deleted`, type: 'error' })}
                          className="w-8 h-8 rounded-xl text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Medicine">
        <div className="space-y-4">
          {[
            { label: 'Medicine Name', placeholder: 'e.g. Paracetamol 500mg' },
            { label: 'SKU Code', placeholder: 'e.g. MED-009' },
            { label: 'Category', placeholder: 'e.g. Pain Relief' },
            { label: 'Initial Stock', placeholder: 'e.g. 100' },
            { label: 'Price (₹)', placeholder: 'e.g. 45' },
          ].map(f => (
            <div key={f.label}>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">{f.label}</label>
              <input
                placeholder={f.placeholder}
                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => setShowModal(false)}>Cancel</Button>
            <Button fullWidth onClick={() => { setShowModal(false); toast({ message: 'Medicine added successfully!', type: 'success' }) }}>Add Medicine</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── DRIVERS TAB ───────────────────────────────────────────────────────────────
function DriversTab() {
  const [search, setSearch] = useState('')
  const toast = useToast()
  const qc = useQueryClient()
  const { data: driversData = [], isLoading } = useAdminDrivers()
  const filtered = driversData.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const statusBadge = { Active: 'green', 'On Delivery': 'blue', Offline: 'gray' }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search drivers..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-primary-400 text-slate-800 dark:text-slate-200 transition-colors"
          />
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => toast({ message: 'Driver onboarding started', type: 'info' })}>Add Driver</Button>
      </div>

      {isLoading && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((driver, i) => (
          <motion.div
            key={driver._id || driver.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-soft hover:shadow-card transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-white font-black text-sm">
                    {driver.name?.charAt(0) || '?'}
                  </div>
                  {driver.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{driver.name}</p>
                  <p className="text-xs text-slate-400">{driver.vehicle?.model || 'Bike'} · {driver.totalDeliveries || 0} trips</p>
                </div>
              </div>
              <Badge variant={driver.isOnline ? 'green' : 'gray'} dot>{driver.isOnline ? 'Online' : 'Offline'}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-2.5 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">{(driver.rating || 0).toFixed(1)}</p>
                <p className="text-xs text-slate-400">Rating ⭐</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-2.5 text-center">
                <p className="text-lg font-black text-slate-800 dark:text-white">₹{((driver.totalEarnings || 0) / 1000).toFixed(1)}k</p>
                <p className="text-xs text-slate-400">Earned</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" fullWidth icon={<Eye className="w-3.5 h-3.5" />}>View</Button>
              <Button size="sm" fullWidth onClick={() => toast({ message: `Payout approved for ${driver.name}`, type: 'success' })}>Pay Out</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── ORDERS TAB ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const [search, setSearch] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const toast = useToast()
  const qc = useQueryClient()
  const { data: ordersData, isLoading } = useAdminOrders({ limit: 50 })
  const { data: driversData = [] } = useAdminDrivers()
  const allOrders = ordersData?.orders || []
  const orders = allOrders.filter(o => !search || o.orderId?.toLowerCase().includes(search.toLowerCase()))

  const statusStyle = {
    delivered: { badge: 'green', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
    out_for_delivery: { badge: 'blue', icon: <Truck className="w-4 h-4 text-blue-500" /> },
    confirmed: { badge: 'yellow', icon: <Clock className="w-4 h-4 text-yellow-500" /> },
    placed: { badge: 'gray', icon: <Clock className="w-4 h-4 text-slate-400" /> },
    cancelled: { badge: 'red', icon: <XCircle className="w-4 h-4 text-red-500" /> },
  }

  const handleAssign = async (orderId, driverId) => {
    try {
      await adminApi.assignDriver(orderId, driverId)
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast({ message: 'Driver assigned successfully', type: 'success' })
      setAssignModal(null)
    } catch {
      toast({ message: 'Failed to assign driver', type: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-primary-400 text-slate-800 dark:text-slate-200 transition-colors"
          />
        </div>
        <Button icon={<Filter className="w-4 h-4" />} variant="outline">Filter</Button>
        <Button icon={<Download className="w-4 h-4" />} variant="outline">Export</Button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                {['Order ID', 'Items', 'Date', 'Amount', 'Driver', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {isLoading && (
                <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" /></td></tr>
              )}
              {orders.map((order, i) => {
                const s = statusStyle[order.status] || { badge: 'gray', icon: <Clock className="w-4 h-4 text-slate-400" /> }
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{order.orderId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300 max-w-40 truncate">{order.items?.map(i => i.name).join(', ')}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 font-bold text-sm text-slate-800 dark:text-white">₹{order.total}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{order.driver?.name || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {s.icon}
                        <Badge variant={s.badge}>{order.status}</Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {!order.driver && (
                          <button
                            onClick={() => setAssignModal(order._id)}
                            className="w-8 h-8 rounded-xl text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-colors"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Driver Modal */}
      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Driver">
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Select an available driver for this order</p>
          {driversData.filter(d => d.isOnline).map(driver => (
            <button
              key={driver._id}
              onClick={() => handleAssign(assignModal, driver._id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border border-transparent hover:border-primary-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">{driver.name?.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-white">{driver.name}</p>
                <p className="text-xs text-slate-400">⭐ {(driver.rating || 0).toFixed(1)} · {driver.totalDeliveries || 0} trips</p>
              </div>
              <Badge variant="green" dot>Online</Badge>
            </button>
          ))}
          {driversData.filter(d => d.isOnline).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No online drivers available</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

// ─── SETTINGS TAB ──────────────────────────────────────────────────────────────
function SettingsTab() {
  const { isDark, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [autoAssign, setAutoAssign] = useState(true)
  const toast = useToast()

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}
    >
      <motion.div animate={{ x: value ? 20 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
    </button>
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            <div>
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-400">Switch between light and dark theme</p>
            </div>
          </div>
          <Toggle value={isDark} onChange={toggleTheme} />
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Notifications</h3>
        {[
          { label: 'Push Notifications', sub: 'New orders and alerts', val: notifications, set: setNotifications },
          { label: 'Auto-assign Drivers', sub: 'Auto-assign nearest available driver', val: autoAssign, set: setAutoAssign },
        ].map(({ label, sub, val, set }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b last:border-0 border-slate-50 dark:border-slate-700/50">
            <div>
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
            <Toggle value={val} onChange={set} />
          </div>
        ))}
      </Card>

      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">System</h3>
        <div className="space-y-3">
          <Button variant="outline" fullWidth onClick={() => toast({ message: 'Cache cleared successfully', type: 'success' })} icon={<RefreshCw className="w-4 h-4" />}>
            Clear Cache
          </Button>
          <Button variant="danger" fullWidth icon={<XCircle className="w-4 h-4" />}>
            Reset All Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ─── MAIN ADMIN DASHBOARD ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const toast = useToast()

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardTab />
      case 'Inventory': return <InventoryTab />
      case 'Drivers': return <DriversTab />
      case 'Orders': return <OrdersTab />
      case 'Settings': return <SettingsTab />
      default: return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400">
          <Package className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-semibold text-lg">{activeTab} coming soon</p>
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden pt-20">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white">{activeTab}</h1>
            <p className="text-xs text-slate-400 mt-0.5">MB-Medicos Admin Panel · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.div key={isDark ? 'sun' : 'moon'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                </motion.div>
              </AnimatePresence>
            </button>
            <button
              onClick={() => toast({ message: '3 new orders require attention!', type: 'warning' })}
              className="relative w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
            >
              <Bell className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-sm">AD</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
