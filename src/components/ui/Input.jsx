import clsx from 'clsx'

export default function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={clsx(
            'w-full bg-slate-50 dark:bg-slate-800 border rounded-2xl px-4 py-3 text-sm',
            'text-slate-800 dark:text-slate-200 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400',
            'transition-all duration-200',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 dark:border-slate-700',
            icon && 'pl-11',
            iconRight && 'pr-11',
            inputClassName
          )}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3.5 text-slate-400">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
