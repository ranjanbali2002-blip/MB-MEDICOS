import { motion } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut,
  Bell, HelpCircle, CreditCard
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { label: 'Orders', icon: ShoppingBag, badge: null },
  { label: 'Inventory', icon: Package, badge: null },
  { label: 'Drivers', icon: Truck, badge: null },
  { label: 'Customers', icon: Users, badge: null },
  { label: 'Payments', icon: CreditCard, badge: null },
  { label: 'Settings', icon: Settings, badge: null },
]

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 overflow-hidden flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg font-black">M</span>
        </div>
        <motion.span
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          className="text-lg font-black text-slate-800 dark:text-white overflow-hidden whitespace-nowrap"
        >
          Medi<span className="text-gradient">Drop</span>
        </motion.span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {navItems.map(({ label, icon: Icon, badge }) => {
            const active = activeTab === label
            return (
              <motion.button
                key={label}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(label)}
                className={clsx(
                  'flex items-center gap-3 rounded-2xl transition-all duration-200 relative group',
                  collapsed ? 'p-3 justify-center' : 'px-3 py-2.5',
                  active
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-card'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <motion.span
                  animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                  className="text-sm font-semibold overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
                {badge && !collapsed && (
                  <span className={clsx(
                    'ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full',
                    active ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  )}>
                    {badge}
                  </span>
                )}
                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div className="absolute left-full ml-3 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {label}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-1">
        {[
          { icon: Bell, label: 'Notifications' },
          { icon: HelpCircle, label: 'Help' },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className={clsx(
              'flex items-center gap-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-all',
              collapsed ? 'p-3 justify-center' : 'px-3 py-2.5'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <motion.span animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }} className="text-sm font-medium overflow-hidden whitespace-nowrap">
              {label}
            </motion.span>
          </button>
        ))}

        {/* User Profile */}
        <div className={clsx(
          'flex items-center gap-3 mt-1 p-2 rounded-2xl bg-slate-50 dark:bg-slate-700/50',
          collapsed && 'justify-center'
        )}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AD</span>
          </div>
          <motion.div animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }} className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-800 dark:text-white whitespace-nowrap">Admin User</p>
            <p className="text-xs text-slate-400 whitespace-nowrap">admin@medidrop.in</p>
          </motion.div>
          <motion.button animate={{ opacity: collapsed ? 0 : 1 }} className="text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
      </button>
    </motion.aside>
  )
}
