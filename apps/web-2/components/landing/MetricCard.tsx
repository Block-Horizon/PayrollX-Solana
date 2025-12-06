"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"

interface MetricCardProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  detail: string
}

export const MetricCard = ({ value, suffix = "", prefix = "", label, detail }: MetricCardProps) => {
  const { count, ref, replay } = useAnimatedCounter(value, 1500)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <motion.div
      ref={ref}
      className="relative flex-1 min-w-[140px] text-center cursor-pointer group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={replay}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-[#fafafa] font-mono text-3xl sm:text-4xl font-medium tracking-tight transition-colors group-hover:text-[#5eead4]">
        {prefix}{count}{suffix}
      </div>
      <div className="text-[#52525b] text-sm mt-1 group-hover:text-[#71717a] transition-colors">{label}</div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-xs text-[#a1a1aa] whitespace-nowrap z-10"
          >
            {detail}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#18181b] border-l border-t border-[#27272a] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
