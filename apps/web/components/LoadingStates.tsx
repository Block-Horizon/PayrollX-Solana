'use client'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/10 rounded ${className}`} />
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <SkeletonLoader className="h-4 w-24" />
          <SkeletonLoader className="h-4 w-32" />
          <SkeletonLoader className="h-4 w-20" />
          <SkeletonLoader className="h-4 w-16" />
          <SkeletonLoader className="h-4 w-12" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          <SkeletonLoader className="h-6 w-3/4" />
          <SkeletonLoader className="h-4 w-full" />
          <SkeletonLoader className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <SkeletonLoader className="h-8 w-64" />
            <SkeletonLoader className="h-4 w-48" />
          </div>
          <SkeletonLoader className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = "md", message }: { size?: "sm" | "md" | "lg", message?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-purple-500 border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {message && (
        <p className="text-white/80 text-sm">{message}</p>
      )}
    </div>
  )
}

export function ErrorMessage({ 
  error, 
  onRetry 
}: { 
  error: string, 
  onRetry?: () => void 
}) {
  return (
    <Card className="bg-red-500/10 border-red-500/30 max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  )
}
