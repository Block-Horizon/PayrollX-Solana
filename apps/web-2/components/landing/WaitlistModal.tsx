"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Logo } from "./ui/Logo"
import { customEase } from "@/lib/animations"

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WaitlistModal = ({ isOpen, onClose }: WaitlistModalProps) => {
  const [formData, setFormData] = useState({ name: "", email: "", twitter: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Waitlist submission:", formData)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleClose = useCallback(() => {
    onClose()
    setTimeout(() => {
      setFormData({ name: "", email: "", twitter: "" })
      setIsSubmitted(false)
    }, 300)
  }, [onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: customEase }}
            className="relative w-full max-w-md"
          >
            <div className="bg-[#0f0f11] border border-[#27272a] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Logo />
                  <span className="text-[#fafafa] font-semibold">PayrollX</span>
                </div>
                <button onClick={handleClose} className="text-[#52525b] hover:text-[#fafafa] transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              {!isSubmitted ? (
                <>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#fafafa] mb-2">Join the Waitlist</h3>
                  <p className="text-[#71717a] text-sm mb-6">Be among the first to experience next-gen payroll on Solana.</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-[#a1a1aa] text-sm block mb-2">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-[#fafafa] text-sm focus:outline-none focus:border-[#5eead4]/50 focus:ring-1 focus:ring-[#5eead4]/50 transition-colors placeholder:text-[#52525b]"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-[#a1a1aa] text-sm block mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-[#fafafa] text-sm focus:outline-none focus:border-[#5eead4]/50 focus:ring-1 focus:ring-[#5eead4]/50 transition-colors placeholder:text-[#52525b]"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label className="text-[#a1a1aa] text-sm block mb-2">Twitter / X <span className="text-[#52525b]">(optional)</span></label>
                      <input
                        type="text"
                        value={formData.twitter}
                        onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-3 text-[#fafafa] text-sm focus:outline-none focus:border-[#5eead4]/50 focus:ring-1 focus:ring-[#5eead4]/50 transition-colors placeholder:text-[#52525b]"
                        placeholder="@handle"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#09090b] font-medium py-3 rounded-lg text-sm mt-2 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Get Early Access"}
                    </Button>
                  </form>
                  <p className="text-[#52525b] text-xs text-center mt-4">We respect your privacy. No spam, ever.</p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-[#5eead4]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-[#fafafa] mb-2">You&apos;re on the list!</h3>
                  <p className="text-[#71717a] text-sm">We&apos;ll be in touch soon with your early access.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
