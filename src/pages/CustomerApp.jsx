import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Star, ShoppingCart, Heart, MapPin, Clock,
  ChevronRight, Plus, Minus, Trash2, ArrowLeft, CheckCircle,
  Phone, MessageCircle, Navigation, Package, User, Home,
  CreditCard, Wallet, Banknote, Upload, Shield, Zap,
  Bell, Settings, FileText, AlertCircle, X, Loader2
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import SearchBar from '../components/ui/SearchBar'
import { MedicineCardSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../contexts/AuthContext'
import { medicinesApi, cartApi, ordersApi } from '../services/api'
import { categories, pharmacies } from '../data/mockData'

// React Query hooks
function useMedicines(params) {
  return useQuery({
    queryKey: ['medicines', params],
    queryFn: () => medicinesApi.getAll(params).then(r => r.data),
    keepPreviousData: true,
  })
}

function useCart() {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then(r => r.data),
  })

  const addItem = async (medicineId, qty = 1) => {
    await cartApi.add(medicineId, qty)
    qc.invalidateQueries({ queryKey: ['cart'] })
  }

  const updateItem = async (medicineId, qty) => {
    await cartApi.updateItem(medicineId, qty)
    qc.invalidateQueries({ queryKey: ['cart'] })
  }

  const removeItem = async (medicineId) => {
    await cartApi.removeItem(medicineId)
    qc.invalidateQueries({ queryKey: ['cart'] })
  }

  return { ...query, addItem, updateItem, removeItem }
}

function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll().then(r => r.data),
  })
}

const tabs = ['Home', 'Medicines', 'Cart', 'Orders', 'Profile']
const tabIcons = [Home, Search, ShoppingCart, Package, User]

// ─── HOME SCREEN ───────────────────────────────────────────────────────────────
function HomeScreen({ setScreen, cart, addToCart, user }) {
  const { data: medsData, isLoading: loading } = useMedicines({ limit: 8, sort: '-createdAt' })
  const medicines = medsData?.medicines || []

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-accent-600 px-4 pt-8 pb-16 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Good morning 👋</p>
            <h1 className="text-xl font-black">{user?.name || 'Guest'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center font-bold text-sm">AK</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-white/80 text-sm mb-5">
          <MapPin className="w-4 h-4" />
          <span>Indiranagar, Bangalore — 560038</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
        <SearchBar placeholder="Search medicines, brands..." className="-mb-6" />
      </div>

      <div className="px-4 pt-8 space-y-6">
        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-5 text-white"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-30">💊</div>
          <Badge variant="yellow" className="mb-2 bg-white/30 text-white border-0">Limited Offer</Badge>
          <h3 className="font-black text-lg mb-1">First Order 20% OFF</h3>
          <p className="text-white/80 text-sm mb-3">Use code MBFIRST20 at checkout</p>
          <Button size="sm" className="bg-white text-orange-500 hover:bg-white/90 shadow-none">
            Shop Now
          </Button>
        </motion.div>

        {/* Express Delivery Banner */}
        <div className="flex gap-3">
          <div className="flex-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-white">8 Min</p>
              <p className="text-xs text-slate-500">Express delivery</p>
            </div>
          </div>
          <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-white">Upload Rx</p>
              <p className="text-xs text-slate-500">Auto-fill cart</p>
            </div>
          </div>
          <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <p className="font-bold text-sm text-slate-800 dark:text-white">Near You</p>
              <p className="text-xs text-slate-500">3 pharmacies</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800 dark:text-white">Categories</h2>
            <button className="text-primary-500 text-sm font-semibold" onClick={() => {}}>See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-soft w-20"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center leading-tight">{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Nearby Pharmacies */}
        <div>
          <h2 className="font-black text-slate-800 dark:text-white mb-4">Nearby Pharmacies</h2>
          <div className="space-y-3">
            {pharmacies.slice(0, 3).map(p => (
              <Card key={p.id} hover padding={false}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🏥</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-800 dark:text-white">{p.name}</p>
                      {p.badge && <Badge variant={p.badge === 'Express' ? 'green' : 'blue'} className="text-[10px]">{p.badge}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.distance}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.eta}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{p.rating}</span>
                    </div>
                  </div>
                  <Badge variant={p.open ? 'green' : 'gray'} dot>{p.open ? 'Open' : 'Closed'}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Medicines */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-800 dark:text-white">Popular Medicines</h2>
            <button className="text-primary-500 text-sm font-semibold" onClick={() => {}}>View all</button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <MedicineCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {medicines.slice(0, 4).map(med => (
                <MedicineCard key={med.id} med={med} addToCart={addToCart} setScreen={setScreen} toast={toast} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MEDICINE CARD ─────────────────────────────────────────────────────────────
function MedicineCard({ med, addToCart, setScreen, toast }) {
  const [liked, setLiked] = useState(false)
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-100 dark:border-slate-700 shadow-soft cursor-pointer"
      onClick={() => setScreen({ name: 'detail', data: med })}
    >
      <div className="relative">
        {med.badge && <Badge variant={med.inStock ? 'green' : 'red'} className="text-[10px] mb-2">{med.badge}</Badge>}
        {med.prescription && <Badge variant="blue" className="text-[10px] mb-2 ml-1">Rx</Badge>}
        <button
          className="absolute top-0 right-0 p-1"
          onClick={e => { e.stopPropagation(); setLiked(!liked) }}
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} />
        </button>
      </div>
      <div className="text-3xl text-center my-3">{med.image}</div>
      <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{med.name}</p>
      <p className="text-xs text-slate-400 mb-2">{med.brand}</p>
      <div className="flex items-center gap-1 mb-3">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{med.rating}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-black text-slate-800 dark:text-white">₹{med.price}</span>
          <span className="text-xs text-slate-400 line-through ml-1">₹{med.mrp}</span>
        </div>
        {med.inStock ? (
          <button
            onClick={e => { e.stopPropagation(); addToCart(med); toast({ message: `${med.name} added to cart!`, type: 'success' }) }}
            className="w-8 h-8 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        ) : (
          <Badge variant="red" className="text-[10px]">Out of Stock</Badge>
        )}
      </div>
    </motion.div>
  )
}

// ─── MEDICINE LISTING ──────────────────────────────────────────────────────────
function MedicineListingScreen({ setScreen, addToCart }) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const filters = ['All', 'Pain Relief', 'Vitamins', 'Antibiotics', 'Diabetes', 'Heart Care']

  const { data: medsData, isLoading } = useMedicines({
    search: search || undefined,
    category: activeFilter === 'All' ? undefined : activeFilter,
    limit: 40,
  })
  const filtered = medsData?.medicines || []

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm outline-none text-slate-800 dark:text-slate-200"
            />
          </div>
          <button className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 grid grid-cols-2 gap-4">
        {filtered.map(med => (
          <MedicineCard key={med.id} med={med} addToCart={addToCart} setScreen={setScreen} toast={toast} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No medicines found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MEDICINE DETAIL ───────────────────────────────────────────────────────────
function MedicineDetailScreen({ med, setScreen, addToCart }) {
  const [qty, setQty] = useState(1)
  const toast = useToast()

  return (
    <div className="pb-28">
      <div className="relative bg-gradient-to-br from-slate-50 to-primary-50 dark:from-slate-800 dark:to-primary-900/20 px-4 pt-4 pb-10">
        <button onClick={() => setScreen({ name: 'listing' })} className="mb-4 w-10 h-10 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-soft">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="text-8xl text-center py-6">{med.image}</div>
        {med.prescription && (
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-2.5 mt-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Prescription Required</span>
          </div>
        )}
      </div>

      <div className="px-4 -mt-6">
        <Card>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white">{med.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{med.brand} · {med.category}</p>
            </div>
            <button><Heart className="w-6 h-6 text-slate-300 hover:text-red-500 transition-colors" /></button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-sm text-slate-800 dark:text-white">{med.rating}</span>
              <span className="text-xs text-slate-400">({med.reviews})</span>
            </div>
            <Badge variant={med.inStock ? 'green' : 'red'} dot>{med.inStock ? 'In Stock' : 'Out of Stock'}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-3">
              <p className="text-slate-400 text-xs mb-1">Manufacturer</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{med.manufacturer}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-3">
              <p className="text-slate-400 text-xs mb-1">Expiry</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{med.expiry}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{med.description}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{med.dosage}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Side Effects</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{med.sideEffects}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 flex items-center gap-4">
        <div>
          <p className="text-2xl font-black text-slate-800 dark:text-white">₹{med.price * qty}</p>
          <p className="text-xs text-slate-400 line-through">₹{med.mrp * qty} MRP</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
            <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <span className="w-8 text-center font-bold text-slate-800 dark:text-white text-sm">{qty}</span>
          <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        <Button fullWidth disabled={!med.inStock} onClick={() => { addToCart({ ...med, qty }); toast({ message: 'Added to cart!', type: 'success' }) }}>
          {med.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  )
}

// ─── CART ──────────────────────────────────────────────────────────────────────
function CartScreen({ cart, updateCart, removeFromCart, setScreen }) {
  const subtotal = cart.reduce((s, i) => s + i.price * (i.qty || 1), 0)
  const delivery = subtotal > 299 ? 0 : 29
  const discount = Math.floor(subtotal * 0.05)
  const total = subtotal + delivery - discount

  if (cart.length === 0) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <div className="text-7xl mb-4">🛒</div>
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Cart is Empty</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Add medicines to your cart to get started</p>
      <Button onClick={() => setScreen({ name: 'listing' })}>Browse Medicines</Button>
    </div>
  )

  return (
    <div className="pb-32 px-4 pt-4 space-y-4">
      <h1 className="text-xl font-black text-slate-800 dark:text-white">My Cart ({cart.length})</h1>

      {/* Prescription upload prompt */}
      <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-3">
        <Upload className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">Some items require a prescription. <span className="underline cursor-pointer">Upload here</span></p>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {cart.map(item => (
          <Card key={item.id} padding={false}>
            <div className="flex items-center gap-4 p-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{item.image}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{item.name}</p>
                <p className="text-xs text-slate-400">{item.brand}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-primary-600 dark:text-primary-400">₹{item.price * (item.qty || 1)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCart(item.id, Math.max(1, (item.qty || 1) - 1))}
                      className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Minus className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <span className="text-sm font-bold text-slate-800 dark:text-white w-5 text-center">{item.qty || 1}</span>
                    <button onClick={() => updateCart(item.id, (item.qty || 1) + 1)}
                      className="w-7 h-7 rounded-xl bg-primary-500 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center ml-1">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bill Summary */}
      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Item Total', val: `₹${subtotal}` },
            { label: 'Delivery Fee', val: delivery === 0 ? 'FREE 🎉' : `₹${delivery}` },
            { label: 'Discount (5%)', val: `-₹${discount}`, green: true },
          ].map(({ label, val, green }) => (
            <div key={label} className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              <span className={`font-semibold ${green ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'}`}>{val}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-2 flex justify-between font-black text-base">
            <span className="text-slate-800 dark:text-white">Total</span>
            <span className="text-primary-600 dark:text-primary-400">₹{total}</span>
          </div>
        </div>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4">
        <Button fullWidth size="lg" onClick={() => setScreen({ name: 'checkout' })}>
          Proceed to Checkout · ₹{total}
        </Button>
      </div>
    </div>
  )
}

// ─── UPI PAYMENT PANEL ─────────────────────────────────────────────────────────
const UPI_ID = 'ranjanbali2002-1@okhdfcbank'
const UPI_NAME = 'MB-Medicos'

function UpiPaymentPanel({ amount, onPaid }) {
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('MB-Medicos Order')}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-3 p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Scan to pay ₹{amount}</p>
        <img
          src={qrUrl}
          alt="UPI QR Code"
          className="w-48 h-48 rounded-xl border-4 border-white shadow-lg"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          UPI ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 select-all">{UPI_ID}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`gpay://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('MB-Medicos Order')}`}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:border-primary-300 transition-all"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" className="w-5 h-5 object-contain" alt="GPay" />
          GPay
        </a>
        <a
          href={upiString}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:border-primary-300 transition-all"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" className="w-5 h-5 object-contain" alt="PhonePe" />
          PhonePe
        </a>
      </div>

      <button
        onClick={onPaid}
        className="w-full py-3.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        I have paid · ₹{amount}
      </button>
      <p className="text-center text-xs text-slate-400">Your order will be confirmed once payment is received</p>
    </div>
  )
}

// ─── CHECKOUT ──────────────────────────────────────────────────────────────────
function CheckoutScreen({ setScreen }) {
  const [payMethod, setPayMethod] = useState('upi')
  const [step, setStep] = useState(1)
  const [showUpi, setShowUpi] = useState(false)
  const toast = useToast()

  const ORDER_AMOUNT = 368

  const payMethods = [
    { id: 'upi', label: 'UPI / GPay', icon: <Wallet className="w-4 h-4" />, sub: 'GPay, PhonePe, Paytm' },
    { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" />, sub: 'Debit / Credit' },
    { id: 'cod', label: 'Cash', icon: <Banknote className="w-4 h-4" />, sub: 'Pay on delivery' },
  ]

  const placeOrder = () => {
    if (payMethod === 'upi' && !showUpi) {
      setShowUpi(true)
      return
    }
    toast({ message: 'Order placed! Track it in Orders.', type: 'success' })
    setScreen({ name: 'tracking' })
  }

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen({ name: 'cart' })} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-xl font-black text-slate-800 dark:text-white">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-2">
        {['Address', 'Payment', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              step > i + 1 ? 'bg-primary-500 text-white' : step === i + 1 ? 'bg-primary-100 text-primary-600 border-2 border-primary-400' : 'bg-slate-100 text-slate-400'
            }`}>
              {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold ${step === i + 1 ? 'text-primary-600' : 'text-slate-400'}`}>{s}</span>
            {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > i + 1 ? 'bg-primary-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      {/* Delivery Address */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 dark:text-white">Delivery Address</h3>
          <button className="text-xs text-primary-500 font-semibold">Change</button>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-white">Home</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">12, 5th Cross, Indiranagar, Bangalore - 560038</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-xl px-3 py-2">
          <Zap className="w-4 h-4" /> Estimated delivery: <strong>8–12 minutes</strong>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-3">Payment Method</h3>
        <div className="space-y-2">
          {payMethods.map(m => (
            <button
              key={m.id}
              onClick={() => setPayMethod(m.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                payMethod === m.id ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-100 dark:border-slate-700 hover:border-slate-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${payMethod === m.id ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                {m.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm text-slate-800 dark:text-white">{m.label}</p>
                <p className="text-xs text-slate-400">{m.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payMethod === m.id ? 'border-primary-500' : 'border-slate-300 dark:border-slate-600'}`}>
                {payMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* UPI Payment Panel */}
      {payMethod === 'upi' && showUpi && (
        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-3">Pay via UPI</h3>
          <UpiPaymentPanel amount={ORDER_AMOUNT} onPaid={() => {
            toast({ message: 'Payment received! Order confirmed 🎉', type: 'success' })
            setScreen({ name: 'tracking' })
          }} />
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold text-slate-700 dark:text-slate-200">₹387</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span className="font-semibold text-primary-600">FREE</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-semibold text-primary-600">-₹19</span></div>
          <div className="border-t border-slate-100 dark:border-slate-700 pt-2 flex justify-between font-black text-base">
            <span className="text-slate-800 dark:text-white">Total</span>
            <span className="text-primary-600">₹{ORDER_AMOUNT}</span>
          </div>
        </div>
      </Card>

      {!showUpi && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4">
          <Button fullWidth size="lg" onClick={placeOrder}>
            {payMethod === 'upi' ? `Pay ₹${ORDER_AMOUNT} via UPI` : `Place Order · ₹${ORDER_AMOUNT}`}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── ORDER TRACKING ────────────────────────────────────────────────────────────
function OrderTrackingScreen({ setScreen }) {
  const steps = [
    { label: 'Order Placed', sub: '2:14 PM', done: true },
    { label: 'Pharmacy Confirmed', sub: '2:16 PM', done: true },
    { label: 'Picked Up', sub: '2:20 PM', done: true },
    { label: 'Out for Delivery', sub: 'In progress...', done: false, active: true },
    { label: 'Delivered', sub: 'ETA 8 mins', done: false },
  ]

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setScreen({ name: 'orders' })} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Track Order</h1>
          <p className="text-xs text-slate-400">#MD-2024-002</p>
        </div>
      </div>

      {/* Map placeholder */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-accent-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-3xl h-52 mb-5 flex items-center justify-center border border-slate-100 dark:border-slate-700">
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 grid-rows-6 h-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-slate-300 dark:border-slate-600" />
            ))}
          </div>
        </div>
        <div className="relative flex flex-col items-center gap-3">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center shadow-glow text-2xl">🏍️</div>
          </motion.div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card px-4 py-2 text-center">
            <p className="font-black text-lg text-primary-600">8 mins away</p>
            <p className="text-xs text-slate-400">Live tracking enabled</p>
          </div>
        </div>
      </div>

      {/* Driver Card */}
      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center text-white font-black text-lg">AS</div>
          <div className="flex-1">
            <p className="font-black text-slate-800 dark:text-white">Amit Singh</p>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>4.7</span>
              <span>·</span>
              <span>987 deliveries</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-11 h-11 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-500" />
            </button>
            <button className="w-11 h-11 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-500" />
            </button>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Order Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-700" />
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                  s.done ? 'bg-primary-500 shadow-glow' : s.active ? 'bg-white border-2 border-primary-400' : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  {s.done ? <CheckCircle className="w-4 h-4 text-white" /> :
                   s.active ? <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-3 h-3 rounded-full bg-primary-500" /> :
                   <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-500" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${s.done || s.active ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{s.label}</p>
                  <p className="text-xs text-slate-400">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── ORDER HISTORY ─────────────────────────────────────────────────────────────
function OrdersScreen({ setScreen }) {
  const { data: orders = [], isLoading } = useOrders()
  const statusVariant = { delivered: 'green', out_for_delivery: 'blue', confirmed: 'yellow', placed: 'gray', cancelled: 'red' }
  const statusLabel = { delivered: 'Delivered', out_for_delivery: 'Out for Delivery', confirmed: 'Confirmed', placed: 'Placed', cancelled: 'Cancelled' }

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>

  return (
    <div className="pb-24 px-4 pt-4 space-y-4">
      <h1 className="text-xl font-black text-slate-800 dark:text-white">My Orders</h1>
      {orders.length === 0 && <p className="text-slate-400 text-sm text-center py-10">No orders yet</p>}
      {orders.map(order => (
        <Card key={order._id} hover onClick={() => setScreen({ name: 'tracking', data: order })} padding={false}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-800 dark:text-white">{order.orderId}</span>
              <Badge variant={statusVariant[order.status] || 'gray'}>{statusLabel[order.status] || order.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              {new Date(order.createdAt).toLocaleDateString()} · {order.items?.map(i => i.name).join(', ')}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-black text-primary-600 dark:text-primary-400">₹{order.total}</span>
              {order.status === 'out_for_delivery' && (
                <Button size="sm" onClick={e => { e.stopPropagation(); setScreen({ name: 'tracking', data: order }) }}>
                  Track
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ─── PROFILE ───────────────────────────────────────────────────────────────────
function ProfileScreen() {
  const sections = [
    { title: 'Orders & Delivery', items: [{ icon: Package, label: 'Order History' }, { icon: MapPin, label: 'Saved Addresses' }, { icon: Clock, label: 'Reorder History' }] },
    { title: 'Health & Records', items: [{ icon: FileText, label: 'Prescriptions' }, { icon: Shield, label: 'Health Records' }] },
    { title: 'Payments', items: [{ icon: CreditCard, label: 'Payment Methods' }, { icon: Wallet, label: 'MB-Medicos Wallet · ₹250' }] },
    { title: 'Account', items: [{ icon: Bell, label: 'Notifications' }, { icon: Settings, label: 'Settings' }, { icon: Headphones, label: 'Help & Support' }] },
  ]
  const Headphones = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></svg>

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-primary-500 to-accent-600 px-4 pt-8 pb-12 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center font-black text-2xl">AK</div>
          <div>
            <h2 className="text-xl font-black">Ananya Krishnan</h2>
            <p className="text-white/70 text-sm">ananya@email.com · +91 98765 43210</p>
            <Badge variant="blue" className="bg-white/20 text-white border-0 mt-1 text-xs">Premium Member</Badge>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {sections.map(({ title, items }) => (
          <Card key={title} padding={false}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 pt-4 pb-2">{title}</p>
            {items.map(({ icon: Icon, label }, i) => (
              <button key={label} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${i < items.length - 1 ? 'border-b border-slate-50 dark:border-slate-700/50' : ''}`}>
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 text-primary-500" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200 text-left">{label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN CUSTOMER APP ─────────────────────────────────────────────────────────
export default function CustomerApp() {
  const [activeTab, setActiveTab] = useState(0)
  const [screen, setScreen] = useState({ name: 'home' })
  const { user } = useAuth()
  const addToast = useToast()
  const { data: cartData, addItem, updateItem, removeItem } = useCart()

  const cartItems = cartData?.items || []

  const addToCart = async (med) => {
    try {
      await addItem(med._id || med.id, 1)
      addToast({ message: `${med.name} added to cart`, type: 'success' })
    } catch {
      addToast({ message: 'Add to cart failed', type: 'error' })
    }
  }
  const updateCart = async (medicineId, qty) => {
    try { await updateItem(medicineId, qty) } catch {}
  }
  const removeFromCart = async (medicineId) => {
    try { await removeItem(medicineId) } catch {}
  }

  const handleTabChange = (idx) => {
    setActiveTab(idx)
    const screens = ['home', 'listing', 'cart', 'orders', 'profile']
    setScreen({ name: screens[idx] })
  }

  const renderScreen = () => {
    if (screen.name === 'detail') return <MedicineDetailScreen med={screen.data} setScreen={setScreen} addToCart={addToCart} />
    if (screen.name === 'checkout') return <CheckoutScreen setScreen={setScreen} cart={cartItems} />
    if (screen.name === 'tracking') return <OrderTrackingScreen setScreen={setScreen} order={screen.data} />
    if (screen.name === 'listing') return <MedicineListingScreen setScreen={setScreen} addToCart={addToCart} />
    if (screen.name === 'cart') return <CartScreen cart={cartItems} updateCart={updateCart} removeFromCart={removeFromCart} setScreen={setScreen} />
    if (screen.name === 'orders') return <OrdersScreen setScreen={setScreen} />
    if (screen.name === 'profile') return <ProfileScreen user={user} />
    return <HomeScreen setScreen={setScreen} cart={cartItems} addToCart={addToCart} user={user} />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen relative shadow-2xl overflow-hidden">
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-2 py-2 flex items-center justify-around">
          {tabs.map((tab, i) => {
            const Icon = tabIcons[i]
            const isActive = activeTab === i
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(i)}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all relative"
              >
                <div className={`relative p-2 rounded-2xl transition-all ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-500' : 'text-slate-400'}`} />
                  {tab === 'Cart' && cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary-500' : 'text-slate-400'}`}>{tab}</span>
                {isActive && <motion.div layoutId="tab-indicator" className="absolute bottom-0 w-1 h-1 bg-primary-500 rounded-full" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
