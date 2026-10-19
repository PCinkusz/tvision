import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const arrow = 'pointer-events-none absolute top-0 z-10 hidden h-[calc(100%-2.5rem)] w-12 items-center justify-center opacity-0 transition group-hover/row:pointer-events-auto group-hover/row:opacity-100 md:flex'

export function Row({ title, onMore, children, empty }: { title: string; onMore?: () => void; children?: ReactNode; empty?: string }) {
  const sc = useRef<HTMLDivElement>(null)
  const drag = useRef({ down: false, x: 0, left: 0, moved: false })
  const [grabbing, setGrabbing] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  useEffect(() => {
    const el = sc.current
    if (!el) return
    const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 4)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children])
  const scrollBy = (d: number) => sc.current?.scrollBy({ left: d * (sc.current.clientWidth * 0.85), behavior: 'smooth' })
  const end = () => {
    drag.current.down = false
    setGrabbing(false)
  }
  return (
    <section className="group/row mb-7">
      <div className="mb-3 flex items-center gap-3 px-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onMore && (
          <button onClick={onMore} className="group/more flex items-center gap-0.5 rounded-full px-2 py-0.5 text-sm text-[var(--accent)] opacity-0 hover:bg-[var(--accent)]/10 group-hover/row:opacity-100">
            See all <ChevronRight size={16} className="transition-transform group-hover/more:translate-x-0.5" />
          </button>
        )}
      </div>
      {empty ? (
        <div className="glass rounded-2xl px-4 py-6 text-sm text-white/50">{empty}</div>
      ) : (
        <div className="relative">
          {canScroll && <button aria-label="Scroll left" onClick={() => scrollBy(-1)} className={`${arrow} left-0 rounded-l-2xl bg-gradient-to-r from-black/75 to-transparent`}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur hover:scale-110 hover:bg-white/30"><ChevronLeft size={22} /></span>
          </button>}
          <div
            ref={sc}
            className={`noscroll flex snap-x snap-proximity gap-4 overflow-x-auto px-1 pb-4 pt-2 ${grabbing ? 'cursor-grabbing snap-none' : 'scroll-smooth'}`}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') return
              drag.current = { down: true, x: e.clientX, left: sc.current!.scrollLeft, moved: false }
            }}
            onPointerMove={(e) => {
              const d = drag.current
              if (!d.down) return
              const dx = e.clientX - d.x
              if (Math.abs(dx) > 6 && !d.moved) {
                d.moved = true
                setGrabbing(true)
              }
              if (d.moved) sc.current!.scrollLeft = d.left - dx
            }}
            onPointerUp={end}
            onPointerLeave={end}
            onClickCapture={(e) => {
              if (drag.current.moved) {
                e.stopPropagation()
                e.preventDefault()
                drag.current.moved = false
              }
            }}
          >
            {children}
          </div>
          {canScroll && <button aria-label="Scroll right" onClick={() => scrollBy(1)} className={`${arrow} right-0 rounded-r-2xl bg-gradient-to-l from-black/75 to-transparent`}>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur hover:scale-110 hover:bg-white/30"><ChevronRight size={22} /></span>
          </button>}
        </div>
      )}
    </section>
  )
}
