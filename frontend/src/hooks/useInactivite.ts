import { useEffect, useRef } from 'react'

// Actions de l'utilisateur qui prouvent qu'il est encore là
const listEvenementActivite = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

// Appelle onExpiration quand l'utilisateur ne fait plus rien pendant delaiMs.
export function useInactivite(actif: boolean, delaiMs: number, onExpiration: () => void) {
  const refExpiration = useRef(onExpiration)
  useEffect(() => {
    refExpiration.current = onExpiration
  })

  useEffect(() => {
    if (!actif) return

    let minuteur = window.setTimeout(() => refExpiration.current(), delaiMs)

    const relancer = () => {
      window.clearTimeout(minuteur)
      minuteur = window.setTimeout(() => refExpiration.current(), delaiMs)
    }

    listEvenementActivite.forEach((nom) => window.addEventListener(nom, relancer, { passive: true }))

    return () => {
      window.clearTimeout(minuteur)
      listEvenementActivite.forEach((nom) => window.removeEventListener(nom, relancer))
    }
  }, [actif, delaiMs])
}