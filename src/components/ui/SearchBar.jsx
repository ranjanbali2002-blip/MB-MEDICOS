import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Mic, X, Clock, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

const suggestions = [
  'Paracetamol 500mg',
  'Vitamin D3',
  'Azithromycin',
  'Metformin',
  'Omega-3 Fish Oil',
]

export default function SearchBar({ placeholder = 'Search medicines, brands...', size = 'md', className = '' }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const filtered = query.length > 0
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions

  return (
    <div className={clsx('relative', className)}>
      <div className={clsx(
        'flex items-center gap-3 bg-white dark:bg-slate-800 border-2 rounded-2xl transition-all duration-200',
        focused
          ? 'border-primary-400 shadow-glow'
          : 'border-slate-200 dark:border-slate-700',
        size === 'lg' ? 'px-5 py-4' : 'px-4 py-3'
      )}>
        <Search className={clsx('text-slate-400 flex-shrink-0', size === 'lg' ? 'w-6 h-6' : 'w-5 h-5')} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          className={clsx(
            'flex-1 bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400',
            size === 'lg' ? 'text-base' : 'text-sm'
          )}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
        <button className="text-slate-400 hover:text-primary-500 transition-colors">
          <Mic className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {focused && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="p-2">
              {query === '' && (
                <p className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Trending
                </p>
              )}
              {filtered.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
