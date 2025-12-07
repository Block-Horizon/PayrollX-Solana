"use client"

import { motion } from "framer-motion"
import { MetricCard } from "./MetricCard"
import { customEase } from "@/lib/animations"

export const TrustIndicators = () => {
  return (
    <section className="py-16 sm:py-20 border-y border-[#1a1a1c] bg-[#09090b]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: customEase }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-4"
        >
          <MetricCard value={400} suffix="ms" label="Avg Settlement" detail="Solana's sub-second finality" />
          <MetricCard value={2} prefix="$" suffix="M+" label="Processed" detail="Total payroll volume in beta" />
          <MetricCard value={99} suffix=".9%" label="Uptime" detail="Enterprise-grade reliability" />
          <div className="relative flex-1 min-w-[140px] text-center">
            <div className="text-[#fafafa] font-mono text-3xl sm:text-4xl font-medium tracking-tight">SOC 2</div>
            <div className="text-[#52525b] text-sm mt-1">Compliant</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
