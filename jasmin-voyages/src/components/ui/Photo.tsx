import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { SiteImage } from '../../content/images'
import { cn } from '../../lib/cn'

const WIDTHS = [480, 800, 1200, 1600, 2000, 2600]

const isUnsplash = (src: string) => src.startsWith('https://images.unsplash.com/')

const build = (src: string, w: number, q = 72) => `${src}?auto=format&fit=crop&w=${w}&q=${q}`

interface PhotoProps {
  image: SiteImage
  sizes?: string
  priority?: boolean
  className?: string
  imgClassName?: string
  imgStyle?: CSSProperties
  children?: ReactNode
  /** Le texte alternatif est décoratif (image redondante avec un titre). */
  decorative?: boolean
}

/**
 * Photographie responsive.
 * Un aplat atmosphérique aux couleurs de l'image est toujours peint dessous :
 * pendant le chargement, ou si l'image ne peut pas être chargée, la composition reste intacte.
 */
export function Photo({ image, sizes = '100vw', priority, className, imgClassName, imgStyle, children, decorative }: PhotoProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)
  const [shadow, mid, light] = image.tone

  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [image.src])

  const unsplash = isUnsplash(image.src)

  return (
    <div
      className={cn('grain overflow-hidden', /\b(absolute|fixed)\b/.test(className ?? '') ? '' : 'relative', className)}
      style={{
        backgroundColor: mid,
        backgroundImage: `radial-gradient(120% 90% at 72% 18%, ${light} 0%, transparent 55%), radial-gradient(90% 80% at 12% 100%, ${shadow} 0%, transparent 70%), linear-gradient(160deg, ${mid} 0%, ${shadow} 100%)`,
      }}
    >
      {!failed && (
        <img
          ref={ref}
          src={unsplash ? build(image.src, 1600) : image.src}
          srcSet={unsplash ? WIDTHS.map((w) => `${build(image.src, w)} ${w}w`).join(', ') : undefined}
          sizes={sizes}
          alt={decorative ? '' : image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          draggable={false}
          className={cn('photo-img absolute inset-0 h-full w-full object-cover', loaded && 'is-loaded', imgClassName)}
          style={{ objectPosition: image.focus ?? '50% 50%', ...imgStyle }}
        />
      )}
      {failed && !decorative && (
        <span role="img" aria-label={image.alt} className="absolute inset-0" />
      )}
      {children}
    </div>
  )
}
