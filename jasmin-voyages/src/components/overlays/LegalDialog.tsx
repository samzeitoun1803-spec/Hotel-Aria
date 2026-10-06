import { AnimatePresence, motion } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { agency, fullAddress } from '../../content/agency'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { ease } from '../../lib/motion'
import { useScrollLock } from '../../lib/scroll'
import { useTrip, type LegalKind } from '../../lib/trip/TripContext'

export function LegalDialog() {
  const { legal } = useTrip()
  useScrollLock(!!legal)
  return <AnimatePresence>{legal && <Panel key={legal} kind={legal} />}</AnimatePresence>
}

/** Valeur connue, ou libellé « à compléter » bien visible. */
function V({ children }: { children: string | null }) {
  return children ? <>{children}</> : <span className="todo">à compléter</span>
}

function Panel({ kind }: { kind: LegalKind }) {
  const { closeLegal, openLegal } = useTrip()
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, true, closeLegal)
  const l = agency.legal

  return (
    <div className="fixed inset-0 z-[80]">
      <motion.div className="absolute inset-0 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeLegal} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-titre"
        data-lenis-prevent
        className="absolute inset-y-0 right-0 w-full max-w-[680px] overflow-y-auto overscroll-contain bg-paper"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.8, ease: ease.quart }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-6 py-4 backdrop-blur md:px-10">
          <div className="flex gap-2">
            {(['mentions', 'confidentialite'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => openLegal(k)}
                aria-pressed={kind === k}
                className={kind === k ? 'h-10 rounded-full bg-ink px-4 text-[0.9rem] font-semibold text-ivory' : 'h-10 rounded-full px-4 text-[0.9rem] font-semibold text-stone hover:text-ink'}
              >
                {k === 'mentions' ? 'Mentions légales' : 'Confidentialité'}
              </button>
            ))}
          </div>
          <button type="button" onClick={closeLegal} aria-label="Fermer" data-autofocus className="group grid h-11 w-11 place-items-center rounded-full bg-ink text-ivory">
            <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90">
              <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-10 md:px-10 md:py-14">
          <p className="t-meta mb-6 rounded-full border border-dashed border-ink/30 px-3 py-2 text-[0.68rem] text-stone">
            Modèle à compléter et à faire valider — les champs soulignés en pointillés sont à renseigner.
          </p>
          {kind === 'mentions' ? (
            <>
              <h2 id="legal-titre" className="t-h2">
                Mentions légales.
              </h2>
              <Block title="Éditeur du site">
                <p>
                  {agency.name} — <V>{l.companyName}</V>
                  <br />
                  {fullAddress}, {agency.country}
                  <br />
                  Téléphone : {agency.phone.display} — E-mail : {agency.email}
                  <br />
                  SIRET : <V>{l.siret}</V>
                  <br />
                  Directeur de la publication : <V>{l.publicationDirector}</V>
                </p>
              </Block>
              <Block title="Opérateur de voyages">
                <p>
                  Immatriculation au registre des opérateurs de voyages et de séjours (Atout France) : <V>{l.atoutFrance}</V>
                  <br />
                  Garant financier : <V>{l.financialGuarantee}</V>
                  <br />
                  Assurance responsabilité civile professionnelle : <V>{l.insurance}</V>
                </p>
              </Block>
              <Block title="Hébergement">
                <p>
                  <V>{l.host}</V>
                </p>
              </Block>
              <Block title="Propriété intellectuelle">
                <p>
                  Les textes, la mise en page et l’identité visuelle de ce site sont la propriété de {agency.name}. Les photographies sont utilisées sous licence de leurs auteurs respectifs.
                </p>
              </Block>
            </>
          ) : (
            <>
              <h2 id="legal-titre" className="t-h2">
                Confidentialité.
              </h2>
              <Block title="Données collectées">
                <p>
                  Lorsque vous remplissez une demande de voyage, nous recueillons les informations que vous nous confiez : nom, prénom, coordonnées, et les détails de votre projet
                  (destination, dates, nombre de voyageurs, budget, envies).
                </p>
              </Block>
              <Block title="Utilisation">
                <p>
                  Ces informations servent uniquement à répondre à votre demande et à préparer votre voyage. Elles ne sont ni vendues, ni cédées à des tiers à des fins commerciales.
                </p>
              </Block>
              <Block title="Durée de conservation">
                <p>
                  <V>{null}</V> — par exemple : trois ans à compter de notre dernier échange, sauf obligation légale contraire.
                </p>
              </Block>
              <Block title="Vos droits">
                <p>
                  Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition et de portabilité de vos données. Pour l’exercer, écrivez-nous
                  à {agency.email} ou à l’adresse de l’agence. Vous pouvez également introduire une réclamation auprès de la CNIL.
                </p>
              </Block>
              <Block title="Cookies">
                <p>
                  Ce site ne dépose pas de cookie publicitaire. Votre brouillon de demande est conservé uniquement dans votre navigateur pour que vous puissiez la reprendre plus tard. La carte interactive (Google Maps) ne se charge que si vous la demandez.
                </p>
              </Block>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-line pt-5">
      <h3 className="t-h4">{title}</h3>
      <div className="mt-3 text-[1rem] leading-[1.7] text-stone">{children}</div>
    </section>
  )
}
