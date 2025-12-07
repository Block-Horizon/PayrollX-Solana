"use client"

import { motion } from "framer-motion"
import { customEase } from "@/lib/animations"

export const FeaturesSection = () => {
  const features = [
    {
      title: "Real-Time Settlements",
      desc: "Transactions confirm in milliseconds on the Solana network. No more waiting for bank processing.",
      highlight: "400ms average",
    },
    {
      title: "MPC Security",
      desc: "Enterprise-grade Multi-Party Computation protects your treasury with distributed key management.",
      highlight: "No single point of failure",
    },
    {
      title: "Global by Default",
      desc: "Pay anyone, anywhere, instantly. No borders, no restrictions, no excessive fees.",
      highlight: "190+ countries",
    },
    {
      title: "USDC & SOL Support",
      desc: "Pay your team in stablecoins for predictability or native SOL for ecosystem participation.",
      highlight: "Your choice",
    },
  ]

  return (
    <section id="features" className="py-24 sm:py-32 bg-[#09090b]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase }} className="text-center mb-16 sm:mb-20">
          <span className="text-[#5eead4] text-xs font-mono uppercase tracking-widest">Capabilities</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#fafafa] mt-3">Built for Modern Teams</h2>
        </motion.div>

        <div className="space-y-0">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: customEase, delay: index * 0.05 }}
              className="group py-8 border-b border-[#1a1a1c] first:border-t"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-[#fafafa] text-lg font-medium group-hover:text-[#5eead4] transition-colors">{feature.title}</h3>
                    <span className="text-[#5eead4] text-xs font-mono bg-[#5eead4]/10 px-2 py-0.5 rounded">{feature.highlight}</span>
                  </div>
                  <p className="text-[#71717a] text-sm max-w-xl">{feature.desc}</p>
                </div>
                <div className="hidden sm:block">
                  <svg className="w-5 h-5 text-[#27272a] group-hover:text-[#5eead4] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
