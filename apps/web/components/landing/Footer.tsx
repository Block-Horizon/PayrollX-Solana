import { Logo } from "./ui/Logo"

export const Footer = () => {
  return (
    <footer className="border-t border-[#1a1a1c] bg-[#09090b]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-[#52525b] text-sm">© 2025 PayrollX</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/Block-Horizon/PayrollX-Solana" target="_blank" rel="noopener noreferrer" className="text-[#52525b] hover:text-[#fafafa] text-sm transition-colors">GitHub</a>
          <a href="https://twitter.com/ramkumar_9301" target="_blank" rel="noopener noreferrer" className="text-[#52525b] hover:text-[#fafafa] text-sm transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  )
}
