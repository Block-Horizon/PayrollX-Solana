"use client"

import { motion } from "framer-motion"
import { customEase } from "@/lib/animations"

export const SecuritySection = () => {
  const badges = [
    { title: "SOC 2 Type II", desc: "Certified" },
    { title: "MPC Wallets", desc: "Distributed Keys" },
    { title: "Audited", desc: "Smart Contracts" },
  ]

  return (
    <section className="py-24 sm:py-32 bg-[#09090b]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase }}>
          <span className="text-[#5eead4] text-xs font-mono uppercase tracking-widest">Security</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#fafafa] mt-3 mb-4">Enterprise-Grade Protection</h2>
          <p className="text-[#71717a] max-w-xl mx-auto text-sm sm:text-base">Your funds are secured by audited smart contracts and industry-leading MPC technology. No single point of failure.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase, delay: 0.1 }} className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-10 sm:mt-12">
          {badges.map((badge) => (
            <div key={badge.title} className="px-4 sm:px-6 py-3 sm:py-4 border border-[#1a1a1c] rounded-lg">
              <div className="text-[#fafafa] font-medium text-sm sm:text-base">{badge.title}</div>
              <div className="text-[#52525b] text-xs sm:text-sm">{badge.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
