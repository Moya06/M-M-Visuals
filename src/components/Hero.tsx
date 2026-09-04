Skip to content
Moya06
M-M-Visuals
Repository navigation
Code
Issues
Pull requests
Agents
Actions
Projects
Wiki
You only have a single verified email address. We recommend verifying at least one more email address to ensure you can recover your account if you lose access to your primary email.


M-M-Visuals/src/components
/
Hero.tsx
in
main

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing Hero.tsx file contents
  1
  2
  3
  4
  5
  6
  7
  8
  9
 10
 11
 12
 13
 14
 15
 16
 17
 18
 19
 20
 21
 22
 23
 24
 25
 26
 27
 28
 29
 30
 31
 32
 33
 34
 35
 36
import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

export function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    function onScroll() {
      if (bgRef.current) {
        const offset = window.scrollY * 0.35
        bgRef.current.style.transform = `translateY(${offset}px) scale(1.1)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-[var(--bg-primary)] scroll-mt-20 pt-24 pb-16"
    >
      {/* Imagen fotográfica de fondo restaurada */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform scale-105 transition-opacity duration-500"
        style={{ backgroundImage: "url('fotos/DSC01428-2.PNG')" }}
      />

      {/* Capas de iluminación adaptativas según el tema activo */}
      {theme === 'dark' ? (
        <>
          {/* En modo oscuro: viñeta y gradiente nocturno elegante */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[var(--bg-primary)]" />
Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
