import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { agency, mapsLinks } from '../../content/agency'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useNiceTime } from '../../hooks/useNiceTime'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'
import { useScrollLock } from '../../lib/scroll'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { PillButton } from '../ui/Button'

export const navLinks = [
  { id: 'destinations', label: 'Destinations' },
  { id: 'inspirations', label: 'Inspirations' },
  { id: 'sur-mesure', label: 'Sur mesure' },
  { id: 'agence', label: 'L’agence' },
]

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('whitespace-nowrap font-display text-[1.02rem] font-bold uppercase leading-none tracking-[-0.02em]', className)}>
      Jasmin Voyages<span className="text-clay">.</span>
    </span>
  )
}

export function Navbar() {
  const { startRequest } = useTrip()
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  useScrollLock(open)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 64)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className="a-drop fixed inset-x-0 top-[var(--demo-bar)] z-50 flex justify-center px-3 pt-3 md:px-5 md:pt-4" style={{ animationDelay: '0.5s' }}>
        <nav
          aria-label="Navigation principale"
          className={cn(
            'flex w-full items-center justify-between rounded-full border transition-[max-width,background-color,border-color,padding,backdrop-filter] duration-700 ease-[var(--ease-expo)]',
            compact
              ? 'max-w-[980px] border-ink/10 bg-ivory/80 py-1.5 pl-5 pr-1.5 backdrop-blur-xl backdrop-saturate-150'
              : 'max-w-[1440px] border-transparent bg-transparent py-2 pl-3 pr-1 md:pl-6',
          )}
        >
          <a href="#top" className="rounded-full py-2 pr-2" aria-label="Jasmin Voyages — retour en haut de page">
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="group relative block rounded-full px-3.5 py-2 text-[0.95rem] font-medium text-ink/75 transition-colors hover:text-ink"
                >
                  {l.label}
                  <span className="absolute inset-x-3.5 bottom-1.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-x-100" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block">
              <PillButton size="sm" className={compact ? 'h-10' : 'h-11 px-5'} arrow magnetic onClick={() => startRequest()}>
                Créer mon voyage
              </PillButton>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="menu-plein-ecran"
              aria-label="Ouvrir le menu"
              className={cn(
                'group grid place-items-center rounded-full bg-ink text-ivory transition-[width,height,background-color] duration-500 ease-[var(--ease-expo)] hover:bg-[#1d2a2e]',
                compact ? 'h-10 w-10' : 'h-11 w-11',
              )}
            >
              <span className="flex w-4 flex-col gap-[5px]">
                <span className="h-[1.5px] w-full bg-current transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-0.5" />
                <span className="h-[1.5px] w-full origin-right scale-x-[0.6] bg-current transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-x-100" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>{open && <MenuOverlay onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  )
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { startRequest } = useTrip()
  const time = useNiceTime()
  useFocusTrap(ref, true, onClose)

  const links = [...navLinks, { id: 'demande', label: 'Demande de voyage' }]

  return (
    <motion.div
      ref={ref}
      id="menu-plein-ecran"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-theme="dark"
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-ink text-ivory"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.85, ease: ease.quart }}
    >
      <div className="wrap flex items-center justify-between pt-5 md:pt-6">
        <Wordmark className="text-ivory" />
        <button
          type="button"
          onClick={onClose}
          data-autofocus
          aria-label="Fermer le menu"
          className="group grid h-11 w-11 place-items-center rounded-full bg-ivory text-ink"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:rotate-90">
            <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <div className="wrap grid flex-1 content-center gap-14 py-14 lg:grid-cols-12 lg:gap-8">
        <nav aria-label="Menu" className="lg:col-span-8">
          <ul>
            {links.map((l, i) => (
              <li key={l.id} className="border-b border-line-dark first:border-t">
                <motion.a
                  href={`#${l.id}`}
                  onClick={(e) => {
                    if (l.id === 'demande') {
                      e.preventDefault()
                      startRequest()
                    }
                    onClose()
                  }}
                  className="group flex items-baseline gap-5 py-4 md:py-5"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, ease: ease.expo, delay: 0.25 + i * 0.06 }}
                >
                  <span className="t-meta w-8 text-mist">0{i + 1}</span>
                  <span className="t-h1 flex-1 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3">
                    {l.label}
                  </span>
                  <Arrow className="text-2xl text-mist transition-colors group-hover:text-clay-soft md:text-3xl" />
                </motion.a>
              </li>
            ))}
          </ul>
        </nav>

        <motion.aside
          className="flex flex-col justify-end gap-8 lg:col-span-3 lg:col-start-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div>
            <p className="t-meta mb-3 text-mist">L’agence</p>
            <address className="t-body not-italic">
              {agency.street}
              <br />
              {agency.postalCode} {agency.city}
            </address>
            <a href={mapsLinks.directions} target="_blank" rel="noreferrer" className="group mt-3 inline-flex items-center gap-2 text-[0.95rem] text-mist hover:text-ivory">
              Itinéraire <Arrow direction="up-right" />
            </a>
          </div>
          <div>
            <p className="t-meta mb-3 text-mist">Nous joindre</p>
            <a href={agency.phone.href} className="t-h4 block hover:text-clay-soft">
              {agency.phone.display}
            </a>
            <a href={`mailto:${agency.email}`} className="mt-1 block break-all text-[0.98rem] text-ivory/80 hover:text-ivory">
              {agency.email}
            </a>
          </div>
          <p className="t-meta text-mist">
            Nice — <span className="tabular text-ivory">{time}</span>
          </p>
        </motion.aside>
      </div>
    </motion.div>
  )
}
