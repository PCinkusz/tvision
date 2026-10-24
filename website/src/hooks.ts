import { useEffect, useState } from 'react'

export const OWNER = 'PCinkusz'
export const REPO = 'tvision'
export const RELEASES_URL = `https://github.com/${OWNER}/${REPO}/releases/latest`

export interface Release { version: string; url: string; size: string }

/** Latest installer from GitHub releases; falls back to the releases page if unavailable. */
export function useRelease(): Release {
  const [r, setR] = useState<Release>({ version: '', url: RELEASES_URL, size: '' })
  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, { signal: ctrl.signal })
      .then((x) => (x.ok ? x.json() : Promise.reject()))
      .then((j) => {
        const a = (j.assets ?? []).find((s: { name: string }) => s.name.toLowerCase().endsWith('.exe'))
        if (a) setR({ version: String(j.tag_name ?? '').replace(/^v/, ''), url: a.browser_download_url, size: `${Math.round(a.size / 1048576)} MB` })
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [])
  return r
}
