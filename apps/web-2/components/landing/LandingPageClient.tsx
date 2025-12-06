"use client"

import { useState } from "react"
import { Navbar } from "./Navbar"
import { HeroSection } from "./HeroSection"
import { TrustIndicators } from "./TrustIndicators"
import { HowItWorks } from "./HowItWorks"
import { FeaturesSection } from "./FeaturesSection"
import { ProblemSolution } from "./ProblemSolution"
import { SecuritySection } from "./SecuritySection"
import { CTASection } from "./CTASection"
import { Footer } from "./Footer"
import { WaitlistModal } from "./WaitlistModal"

export function LandingPageClient() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Navbar onOpenModal={() => setIsModalOpen(true)} />
      <HeroSection onOpenModal={() => setIsModalOpen(true)} />
      <TrustIndicators />
      <HowItWorks />
      <FeaturesSection />
      <ProblemSolution />
      <SecuritySection />
      <CTASection onOpenModal={() => setIsModalOpen(true)} />
      <Footer />
      <WaitlistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
