import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' })
const now = () => fmt.format(new Date()).replace(':', ' h ')

/** Heure locale à Nice, mise à jour en continu (« — » avant le montage, pour le pré-rendu). */
export function useNiceTime() {
  const [time, setTime] = useState('—')
  useEffect(() => {
    setTime(now())
    const id = window.setInterval(() => setTime(now()), 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}
