interface FloatingOrbProps {
  className?: string
}

export const FloatingOrb = ({ className }: FloatingOrbProps) => (
  <div className={`absolute rounded-full blur-3xl opacity-15 ${className}`} />
)
