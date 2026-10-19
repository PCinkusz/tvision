import { Search, X } from 'lucide-react'
import { useClock } from '../store'

export function TopBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const time = useClock()
  return (
    <header className="flex items-center gap-4 px-8 pb-4 pt-5">
      <div className="glass group flex h-12 flex-1 items-center gap-3 rounded-full px-5 transition focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(45,226,208,.18)] hover:border-white/30">
        <Search size={20} className="text-white/60 transition-colors group-focus-within:text-[var(--accent)]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search channels, sports, documentaries…" className="w-full bg-transparent text-lg outline-none placeholder:text-white/40" />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search" className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>
      <div className="w-20 text-right text-3xl font-light tabular-nums text-white/80">{time}</div>
    </header>
  )
}
