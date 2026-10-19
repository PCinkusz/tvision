import { useCallback, useEffect, useState } from 'react'
import type { Channel } from './types'

export function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => { try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : init } catch { return init } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* quota */ } }, [key, v])
  return [v, setV] as const
}

export function defaultCountry(): string {
  const l = (navigator.language || 'en-US').toLowerCase()
  if (l.startsWith('pl')) return 'PL'
  if (l.startsWith('es')) return 'ES'
  if (l.startsWith('de')) return 'DE'
  if (l.startsWith('fr')) return 'FR'
  if (l === 'en-gb') return 'UK'
  return 'US'
}

const cache = new Map<string, Promise<Channel[]>>()
export function loadCountry(cc: string): Promise<Channel[]> {
  let p = cache.get(cc)
  if (!p) {
    p = fetch(`./data/${cc}.json`, { signal: AbortSignal.timeout(15000) }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json() })
    p.catch(() => cache.delete(cc))
    cache.set(cc, p)
  }
  return p
}

export function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => { const i = setInterval(() => setT(new Date()), 15000); return () => clearInterval(i) }, [])
  return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function useUserData() {
  const [favs, setFavs] = useLocal<string[]>('favs', [])
  const [history, setHistory] = useLocal<{ id: string; t: number }[]>('history', [])
  const [profile, setProfile] = useLocal('profile', { name: 'Guest', color: '#2de2d0' })
  const toggleFav = useCallback((id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])), [setFavs])
  const addHistory = useCallback((id: string) => setHistory((h) => [{ id, t: Date.now() }, ...h.filter((x) => x.id !== id)].slice(0, 60)), [setHistory])
  return { favs, setFavs, toggleFav, history, setHistory, addHistory, profile, setProfile }
}
