"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { customEase } from "@/lib/animations"

interface CTASectionProps {
  onOpenModal: () => void
}

export const CTASection = ({ onOpenModal }: CTASectionProps) => {
  return (
    <section className="py-24 sm:py-32 bg-[#09090b]">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: customEase }} className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#fafafa]">Ready to modernize your payroll?</h2>
        <p className="text-[#71717a] mt-4 text-sm sm:text-base">Join the companies already saving time and money.</p>
        <Button onClick={onOpenModal} className="bg-[#5eead4] text-[#09090b] px-8 py-3 rounded-lg font-medium mt-8 hover:bg-[#5eead4]/90">
          Request Access
        </Button>
      </motion.div>
    </section>
  )
}
