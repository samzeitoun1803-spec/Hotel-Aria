/** Système de mouvement — lent, précis, jamais de rebond. */
export const ease = {
  expo: [0.16, 1, 0.3, 1] as const,
  quart: [0.76, 0, 0.24, 1] as const,
  soft: [0.33, 1, 0.68, 1] as const,
}

export const dur = { fast: 0.45, base: 0.9, slow: 1.3 }

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.expo } },
}
