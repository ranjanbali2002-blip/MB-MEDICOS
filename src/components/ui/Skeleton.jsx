import clsx from 'clsx'

export function Skeleton({ className = '', rounded = 'rounded-2xl' }) {
  return (
    <div className={clsx('skeleton', rounded, className)} />
  )
}

export function MedicineCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-soft">
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20" rounded="rounded-lg" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-soft">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-10 w-10" rounded="rounded-2xl" />
        <Skeleton className="h-6 w-16" rounded="rounded-full" />
      </div>
      <Skeleton className="h-8 w-28 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}
