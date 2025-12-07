"use client"

import { motion } from "framer-motion"
import { customEase } from "@/lib/animations"

export const HowItWorks = () => {
  const steps = [
    { number: "01", title: "Configure", desc: "Set up organization, add employees, connect treasury" },
    { number: "02", title: "Schedule", desc: "Create payroll runs with SOL or USDC, set recurring schedules" },
    { number: "03", title: "Execute", desc: "MPC wallets sign transactions, employees receive funds instantly" },
  ]

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-[#09090b]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase }} className="text-center mb-16 sm:mb-20">
          <span className="text-[#5eead4] text-xs font-mono uppercase tracking-widest">Process</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#fafafa] mt-3">How PayrollX Works</h2>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute top-6 left-[16%] right-[16%] border-t border-dashed border-[#27272a]" />
          <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: customEase, delay: index * 0.1 }}
                className="relative flex-1 text-center md:text-left"
              >
                {index !== steps.length - 1 && <div className="md:hidden absolute left-1/2 top-full h-10 border-l border-dashed border-[#27272a]" />}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#18181b] border border-[#27272a] mb-4">
                  <span className="text-[#5eead4] font-mono text-sm">{step.number}</span>
                </div>
                <h3 className="text-[#fafafa] text-lg sm:text-xl font-medium">{step.title}</h3>
                <p className="text-[#71717a] text-sm mt-2 max-w-xs mx-auto md:mx-0">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
