import { useTheme } from '../context/ThemeContext'

interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className = 'w-full h-full', alt = 'M&M Visuals' }: LogoProps) {
  const { theme } = useTheme()

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {/* Emblema Modo Oscuro */}
      <img
        src="/logo-circle-dark.png"
        alt={`${alt} Modo Oscuro`}
        className={`absolute inset-0 w-full h-full object-contain transition-all duration-600 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100 pointer-events-auto logo-dark-mode'
            : 'opacity-0 -rotate-45 scale-90 pointer-events-none'
        }`}
      />

      {/* Emblema Modo Claro */}
      <img
        src="/logo-circle-light.png"
        alt={`${alt} Modo Claro`}
        className={`absolute inset-0 w-full h-full object-contain transition-all duration-600 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${
          theme === 'light'
            ? 'opacity-100 rotate-0 scale-100 pointer-events-auto logo-light-mode'
            : 'opacity-0 rotate-45 scale-90 pointer-events-none'
        }`}
      />
    </div>
  )
}
