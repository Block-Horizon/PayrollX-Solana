interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export const Logo = ({ width = 32, height = 32, className }: LogoProps) => (
  <img
    src="/px-logo.svg"
    alt="PayrollX Logo"
    width={width}
    height={height}
    className={className}
  />
)
