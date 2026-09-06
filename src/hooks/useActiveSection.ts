import { useEffect, useState } from 'react'

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  const idsKey = ids.join(',')

  useEffect(() => {
    function onScroll() {
      const pos = window.scrollY + 150
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          const h = el.offsetHeight
          if (pos >= top && pos < top + h) {
            setActive(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [idsKey])

  return active
}
