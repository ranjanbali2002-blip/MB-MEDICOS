import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = true,
  onClick,
  animate = false,
  delay = 0,
}) {
  const base = clsx(
    'rounded-3xl transition-all duration-300',
    glass
      ? 'glass'
      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700',
    padding && 'p-6',
    hover && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-1',
    !glass && 'shadow-soft',
    className
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        whileHover={hover ? { y: -4, boxShadow: '0 8px 32px -4px rgba(16,185,129,0.2)' } : {}}
        className={base}
        onClick={onClick}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
      className={base}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
