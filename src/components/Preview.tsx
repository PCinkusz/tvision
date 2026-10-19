import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import type { Channel } from '../types'

// Muted hover preview; starts after a delay. Only the hovered tile mounts it, so one at a time.
export function Preview({ ch }: { ch: Channel }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = ref.current
    const s = ch.s[0]
    if (!v || !s) return
    let hls: Hls | null = null
    const t = window.setTimeout(() => {
      ;(window as any).iptv?.setStreamHeaders({ url: s.u, referer: s.r, ua: s.a })
      if (Hls.isSupported()) {
        hls = new Hls({ startLevel: 0, maxBufferLength: 6, manifestLoadingMaxRetry: 0, levelLoadingMaxRetry: 0, capLevelToPlayerSize: true })
        hls.on(Hls.Events.ERROR, (_e, d) => {
          if (d.fatal) hls?.destroy()
        })
        hls.loadSource(s.u)
        hls.attachMedia(v)
      } else v.src = s.u
      v.play().catch(() => {})
    }, 700)
    return () => {
      clearTimeout(t)
      hls?.destroy()
      v.removeAttribute('src')
      v.load()
    }
  }, [ch])
  return <video ref={ref} muted playsInline className="absolute inset-0 h-full w-full bg-black object-cover" />
}
