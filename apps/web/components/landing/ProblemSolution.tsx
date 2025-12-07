"use client"

import { motion } from "framer-motion"
import { customEase } from "@/lib/animations"

export const ProblemSolution = () => {
  const problems = ["3-5 day settlement times", "High banking fees", "Manual reconciliation", "Limited audit trails", "Geographic restrictions"]
  const solutions = ["Sub-second finality", "Near-zero transaction costs", "Automated compliance", "Immutable audit history", "Global by default"]

  return (
    <section id="security" className="py-24 sm:py-32 border-y border-[#1a1a1c] bg-[#09090b]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase }} className="text-center mb-12 sm:mb-16">
          <span className="text-[#5eead4] text-xs font-mono uppercase tracking-widest">Comparison</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#fafafa] mt-3">Why PayrollX?</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase }}>
            <h3 className="text-[#52525b] text-xs font-mono uppercase tracking-widest mb-6">Traditional Payroll</h3>
            <ul>
              {problems.map((item, index) => (
                <li key={index} className={`text-[#71717a] py-3 sm:py-3.5 flex items-center gap-3 text-sm ${index !== problems.length - 1 ? "border-b border-[#1a1a1c]" : ""}`}>
                  <span className="text-[#ef4444]/60 text-sm flex-shrink-0">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase, delay: 0.1 }}>
            <h3 className="text-[#5eead4] text-xs font-mono uppercase tracking-widest mb-6">With PayrollX</h3>
            <ul>
              {solutions.map((item, index) => (
                <li key={index} className={`text-[#a1a1aa] py-3 sm:py-3.5 flex items-center gap-3 text-sm ${index !== solutions.length - 1 ? "border-b border-[#1a1a1c]" : ""}`}>
                  <span className="text-[#5eead4] flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
