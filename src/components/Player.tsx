import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { ArrowLeft } from 'lucide-react'
import { FavButton } from './FavButton'
import type { Channel } from '../types'

type St = 'loading' | 'playing' | 'failed'

export function Player({ ch, fav, onFav, onClose }: { ch: Channel; fav: boolean; onFav: () => void; onClose: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [idx, setIdx] = useState(0)
  const [st, setSt] = useState<St>('loading')

  useEffect(() => {
    setIdx(0)
  }, [ch])

  useEffect(() => {
    const v = ref.current
    const s = ch.s[idx]
    if (!v) return
    if (!s) {
      setSt('failed')
      return
    }
    setSt('loading')
    ;(window as any).iptv?.setStreamHeaders({ url: s.u, referer: s.r, ua: s.a })
    let hls: Hls | null = null
    let dead = false
    const next = () => {
      if (!dead) {
        dead = true
        setIdx((i) => i + 1)
      }
    }
    const stall = window.setTimeout(next, 15000) // never wait forever on one stream
    const ok = () => {
      clearTimeout(stall)
      setSt('playing')
    }
    v.addEventListener('playing', ok, { once: true })
    if (Hls.isSupported()) {
      hls = new Hls({ manifestLoadingTimeOut: 8000, manifestLoadingMaxRetry: 1, levelLoadingMaxRetry: 1, fragLoadingMaxRetry: 2 })
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (d.fatal) next()
      })
      hls.loadSource(s.u)
      hls.attachMedia(v)
    } else {
      v.src = s.u
      v.addEventListener('error', next, { once: true })
    }
    v.play().catch(() => {})
    return () => {
      dead = true
      clearTimeout(stall)
      v.removeEventListener('playing', ok)
      hls?.destroy()
      v.removeAttribute('src')
      v.load()
    }
  }, [ch, idx])

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent px-5 py-3">
        <button onClick={onClose} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/15"><ArrowLeft size={22} /></button>
        {ch.l && <img src={ch.l} alt="" className="h-8 max-w-24 object-contain" />}
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{ch.n}</div>
          <div className="text-xs text-white/50">
            {ch.s[idx]?.q ?? ''} {ch.s.length > 1 ? `· source ${Math.min(idx + 1, ch.s.length)}/${ch.s.length}` : ''}
          </div>
        </div>
        <FavButton fav={fav} onClick={onFav} />
      </div>
      <div className="relative min-h-0 flex-1">
        <video ref={ref} controls autoPlay className="h-full w-full bg-black" />
        {st === 'loading' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-white/70">
            <div className="rounded-xl bg-black/60 px-4 py-2">Connecting…</div>
          </div>
        )}
        {st === 'failed' && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="glass max-w-sm rounded-2xl p-6 text-center">
              <div className="mb-1 text-lg font-semibold">Channel unavailable</div>
              <div className="mb-4 text-sm text-white/60">None of the {ch.s.length} source(s) responded. It may be offline or geo-blocked.</div>
              <div className="flex justify-center gap-2">
                <button onClick={() => setIdx(0)} className="rounded-lg bg-[var(--accent)] px-4 py-1.5 font-semibold text-black">Retry</button>
                <button onClick={onClose} className="rounded-lg bg-white/10 px-4 py-1.5">Back</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
