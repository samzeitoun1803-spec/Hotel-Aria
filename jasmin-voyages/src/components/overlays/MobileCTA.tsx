import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { agency } from '../../content/agency'
import { ease } from '../../lib/motion'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'

/**
 * Barre d'action mobile : apparaît après le hero,
 * s'efface quand le formulaire ou le pied de page sont à l'écran.
 */
export function MobileCTA() {
  const { startRequest, destinationSlug } = useTrip()
  const [pastHero, setPastHero] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 1.2)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const targets = ['demande', 'agence', 'sur-mesure'].map((id) => document.getElementById(id)).concat(document.querySelector('footer'))
    const visible = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)))
      setHidden(visible.size > 0)
    })
    targets.forEach((t) => t && io.observe(t))
    return () => {
      window.removeEventListener('scroll', onScroll)
      io.disconnect()
    }
  }, [])

  const show = pastHero && !hidden && !destinationSlug

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex gap-2 lg:hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.6, ease: ease.expo }}
        >
          <button
            type="button"
            onClick={() => startRequest(undefined, 'barre-mobile')}
            className="group flex h-14 flex-1 items-center justify-between rounded-full bg-ink pl-6 pr-5 text-[1rem] font-semibold text-ivory"
          >
            Créer mon voyage <Arrow />
          </button>
          <a href={agency.phone.href} aria-label={`Appeler l’agence : ${agency.phone.display}`} className="grid h-14 w-14 place-items-center rounded-full border border-ink/10 bg-ivory/90 text-ink backdrop-blur-xl">
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
              <path
                d="M6.6 2.8 4.4 3.3c-.8.2-1.4 1-1.3 1.8.6 6 5.2 10.6 11.2 11.2.8.1 1.6-.5 1.8-1.3l.5-2.2c.1-.6-.2-1.2-.8-1.4l-2.6-1c-.5-.2-1.1-.1-1.4.3l-.8.9a9 9 0 0 1-4.3-4.3l.9-.8c.4-.4.5-.9.3-1.4l-1-2.6c-.2-.6-.8-.9-1.4-.8Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
