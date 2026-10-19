import { Virtuoso } from 'react-virtuoso'
import { History, Tv } from 'lucide-react'
import type { Channel, CountryMeta, View } from '../types'
import { BrandButton } from './Brand'

const NAV = [
  { name: 'live' as const, label: 'Live TV', Icon: Tv },
  { name: 'history' as const, label: 'History', Icon: History },
]

export function Sidebar({ view, setView, onHome, countries, country, setCountry, channels, onPlay, playingId }: {
  view: View
  setView: (v: View) => void
  onHome: () => void
  countries: CountryMeta[]
  country: string
  setCountry: (c: string) => void
  channels: Channel[]
  onPlay: (c: Channel) => void
  playingId?: string
}) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-white/10 bg-black/30 backdrop-blur-xl">
      <BrandButton onClick={onHome} />
      <nav className="px-4">
        {NAV.map(({ name, label, Icon }) => {
          const active = view.name === name
          return (
            <button key={name} onClick={() => (name === 'live' ? onHome() : setView({ name }))}
              className={`group relative mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-lg ${active ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}>
              <Icon size={22} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">{label}</span>
              {active && <span className="absolute -right-4 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l bg-[var(--accent)]" />}
            </button>
          )
        })}
      </nav>
      <div className="px-6 pb-2 pt-5 text-lg text-white/50">Channels</div>
      <div className="flex gap-1.5 px-5 pb-3">
        {countries.map((c) => (
          <button key={c.code} title={`${c.name} (${c.count})`} onClick={() => setCountry(c.code)}
            className={`grid h-9 flex-1 place-items-center rounded-lg text-xs font-semibold ${c.code === country ? 'bg-[var(--accent)]/20 text-[var(--accent)] ring-1 ring-[var(--accent)]' : 'bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'}`}>
            {c.code}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {channels.length === 0 ? (
          <div className="space-y-3 px-5">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skel h-10 rounded-xl" />)}</div>
        ) : (
          <Virtuoso
            className="thin"
            data={channels}
            computeItemKey={(_, c) => c.id}
            itemContent={(_, c) => (
              <button onClick={() => onPlay(c)} className={`group mx-3 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/10 ${playingId === c.id ? 'bg-white/10' : ''}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/15 bg-white/10 transition-transform duration-200 group-hover:scale-105 group-hover:border-[var(--accent)]/60">
                  {c.l ? <img src={c.l} alt="" loading="lazy" className="h-full w-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : <span className="text-xs font-bold text-white/40">{c.n.slice(0, 2)}</span>}
                </span>
                <span className="min-w-0 flex-1 truncate">{c.n}</span>
                {c.s[0]?.h === 1 && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />}
              </button>
            )}
          />
        )}
      </div>
    </aside>
  )
}
