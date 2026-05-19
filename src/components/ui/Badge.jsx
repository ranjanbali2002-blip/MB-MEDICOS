import clsx from 'clsx'

const variants = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function Badge({ children, variant = 'green', className = '', dot = false }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full', {
          'bg-green-500': variant === 'green',
          'bg-blue-500': variant === 'blue',
          'bg-red-500': variant === 'red',
          'bg-yellow-500': variant === 'yellow',
          'bg-purple-500': variant === 'purple',
          'bg-slate-400': variant === 'gray',
          'bg-orange-500': variant === 'orange',
        })} />
      )}
      {children}
    </span>
  )
}
