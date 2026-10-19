import { memo, useEffect, useRef, useState } from 'react'
import type { Channel } from '../types'
import { getThumb } from '../thumbs'
import { Preview } from './Preview'
import { LogoImg } from './LogoImg'
import { FavButton } from './FavButton'

export const Tile = memo(function Tile({ ch, fav, onPlay, onFav, wide }: { ch: Channel; fav: boolean; onPlay: (c: Channel) => void; onFav: (id: string) => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<string | null>(null)
  const [hover, setHover] = useState(false)
  const [logoOk, setLogoOk] = useState(true)

  // Only capture while on screen; cancelled if scrolled away before it starts.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let visible = false
    let timer: number | undefined
    let started = false
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        clearTimeout(timer)
        if (visible && !started) {
          timer = window.setTimeout(() => {
            started = true
            getThumb(ch, () => !visible).then((d) => {
              if (d) setThumb(d)
              else started = false
            })
          }, 400)
        }
      },
      { rootMargin: '0px 100px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      clearTimeout(timer)
    }
  }, [ch])

  return (
    <div ref={ref} className={`shrink-0 snap-start ${wide ? 'w-72' : 'w-56'}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Play ${ch.n}`}
        onClick={() => onPlay(ch)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(ch) } }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="card glass relative overflow-hidden rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
          {thumb && <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />}
          {hover && <Preview ch={ch} />}
          {!thumb && ch.l && logoOk && <LogoImg src={ch.l} onFail={() => setLogoOk(false)} />}
          {!thumb && (!ch.l || !logoOk) && <div className="absolute inset-0 grid place-items-center text-3xl font-bold text-white/30">{ch.n.slice(0, 2)}</div>}
          {thumb && ch.l && logoOk && <img src={ch.l} alt="" className="absolute left-2 top-2 h-7 max-w-[40%] rounded bg-black/40 object-contain p-0.5" draggable={false} />}
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
          </span>
          <FavButton fav={fav} onClick={() => onFav(ch.id)} className={`absolute bottom-2 right-2 z-10 transition-opacity ${fav || hover ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100'}`} />
        </div>
        <div className="px-3 py-2">
          <div className="truncate text-sm font-semibold">{ch.n}</div>
          <div className="truncate text-xs text-white/50">{ch.c.slice(0, 2).join(' · ') || 'general'}</div>
        </div>
      </div>
    </div>
  )
})
