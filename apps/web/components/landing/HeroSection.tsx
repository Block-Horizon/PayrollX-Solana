"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SolanaIcon } from "./ui/SolanaIcon"
import { GridPattern } from "./ui/GridPattern"
import { FloatingOrb } from "./ui/FloatingOrb"
import { fadeUp, staggerContainer, customEase } from "@/lib/animations"

interface HeroSectionProps {
  onOpenModal: () => void
}

export const HeroSection = ({ onOpenModal }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <GridPattern />
      <FloatingOrb className="w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#5eead4] -top-40 -right-40" />
      <FloatingOrb className="w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-[#0ea5e9] -bottom-20 -left-20" />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: customEase }} className="flex items-center justify-center gap-2 mb-6">
          <span className="text-[#52525b] text-xs font-mono uppercase tracking-widest flex items-center gap-2">
            Built on <SolanaIcon /> Solana
          </span>
        </motion.div>

        <motion.h1 variants={fadeUp} transition={{ duration: 0.6, ease: customEase }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-[#fafafa] tracking-tight leading-[1.05]">
          Payroll that settles in{" "}
          <span className="relative inline-block">
            <span className="relative z-10">seconds</span>
            <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-2 sm:h-3 bg-[#5eead4]/20 -z-0" />
          </span>
          , not days.
        </motion.h1>

        <motion.p variants={fadeUp} transition={{ duration: 0.6, ease: customEase }} className="text-base sm:text-lg md:text-xl text-[#71717a] max-w-2xl mx-auto mt-6 leading-relaxed px-2">
          Enterprise-grade payroll infrastructure powered by blockchain. MPC security, instant USDC settlements, complete transparency.
        </motion.p>

        <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: customEase }} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10">
          <Button onClick={onOpenModal} className="w-full sm:w-auto bg-[#5eead4] text-[#09090b] px-8 py-3 rounded-lg font-medium text-base hover:bg-[#5eead4]/90 transition-colors">
            Get Early Access
          </Button>
          <a href="#how-it-works" className="text-[#52525b] hover:text-[#fafafa] text-base transition-colors flex items-center gap-1 py-3">
            Learn more
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.6, ease: customEase }} className="mt-16 sm:mt-20">
          <p className="text-[#3f3f46] text-sm mb-4">Trusted by 50+ companies in private beta</p>
          <div className="flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center ${i !== 0 ? "-ml-2 sm:-ml-3" : ""}`}>
                <span className="text-[#3f3f46] text-xs font-mono">{String.fromCharCode(65 + i)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
