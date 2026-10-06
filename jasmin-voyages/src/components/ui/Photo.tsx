import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { SiteImage } from '../../content/images'
import { cn } from '../../lib/cn'

const UNSPLASH_WIDTHS = [480, 800, 1200, 1600, 2000, 2600]

const isUnsplash = (src: string) => src.startsWith('https://images.unsplash.com/')

const unsplashUrl = (src: string, w: number, q = 72) => `${src}?auto=format&fit=crop&w=${w}&q=${q}`

/** src + srcset : illustrations locales en plusieurs largeurs, Unsplash redimensionné à la volée, ou fichier simple. */
function sources(image: SiteImage): { src: string; srcSet?: string } {
  if (image.widths?.length) {
    const ws = image.widths
    const mid = ws.find((w) => w >= 1600) ?? ws[ws.length - 1]
    return { src: `${image.src}-${mid}.webp`, srcSet: ws.map((w) => `${image.src}-${w}.webp ${w}w`).join(', ') }
  }
  if (isUnsplash(image.src)) {
    return { src: unsplashUrl(image.src, 1600), srcSet: UNSPLASH_WIDTHS.map((w) => `${unsplashUrl(image.src, w)} ${w}w`).join(', ') }
  }
  return { src: image.src }
}

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
 * Image responsive (illustration ou photographie).
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

  const { src, srcSet } = sources(image)

  return (
    <div
      className={cn('grain overflow-hidden', /\b(absolute|fixed)\b/.test(className ?? '') ? '' : 'relative', className)}
      style={{
        backgroundColor: mid,
        backgroundImage: `radial-gradient(120% 90% at 72% 18%, ${light} 0%, transparent 55%), radial-gradient(90% 80% at 12% 100%, ${shadow} 0%, transparent 70%), linear-gradient(160deg, ${mid} 0%, ${shadow} 100%)`,
      }}
    >
      {!failed && (
        <picture>
          {image.portrait && image.widths?.length && (
            <source media="(max-aspect-ratio: 4/5)" srcSet={image.widths.map((w) => `${image.portrait}-${w}.webp ${w}w`).join(', ')} sizes={sizes} />
          )}
          <img
          ref={ref}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={decorative ? '' : image.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          draggable={false}
          className={cn('photo-img absolute inset-0 h-full w-full object-cover', loaded && 'is-loaded', imgClassName)}
          style={{ objectPosition: image.focus ?? '50% 50%', ...imgStyle }}
          />
        </picture>
      )}
      {failed && !decorative && (
        <span role="img" aria-label={image.alt} className="absolute inset-0" />
      )}
      {children}
    </div>
  )
}
