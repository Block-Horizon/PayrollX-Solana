"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Logo } from "./ui/Logo"
import { customEase } from "@/lib/animations"

interface NavbarProps {
  onOpenModal: () => void
}

export const Navbar = ({ onOpenModal }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: customEase }}
      className={`fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300 ${scrolled ? "bg-[#09090b]/90 backdrop-blur-md border-b border-[#1a1a1c]" : "bg-transparent"}`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-[#fafafa] font-semibold text-lg hidden sm:block">PayrollX</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-[#71717a] hover:text-[#fafafa] transition-colors text-sm">How it Works</a>
          <a href="#features" className="text-[#71717a] hover:text-[#fafafa] transition-colors text-sm">Features</a>
          <a href="#security" className="text-[#71717a] hover:text-[#fafafa] transition-colors text-sm">Security</a>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => console.log("Connect Wallet clicked")}
            className="hidden sm:block border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#52525b] bg-transparent px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Connect Wallet
          </button>
          <Button onClick={onOpenModal} className="bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#09090b] font-medium px-3 sm:px-4 py-2 rounded-lg text-sm">
            Join Waitlist
          </Button>
        </div>
      </nav>
    </motion.header>
  )
}
