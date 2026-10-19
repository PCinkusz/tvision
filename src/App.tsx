import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { VirtuosoGrid } from 'react-virtuoso'
import { GROUPS, type Channel, type CountryMeta, type View } from './types'
import { defaultCountry, loadCountry, useLocal, useUserData } from './store'
import { Trash2 } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { Row } from './components/Row'
import { Tile } from './components/Tile'
import { Player } from './components/Player'

const ROW_LIMIT = 20
const score = (c: Channel) => (c.s[0]?.h === 1 ? 2 : 0) + (c.l ? 1 : 0)

export default function App() {
  const [countries, setCountries] = useState<CountryMeta[]>([])
  const [country, setCountry] = useLocal('country', defaultCountry())
  const [channels, setChannels] = useState<Channel[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [view, setView] = useState<View>({ name: 'live' })
  const [query, setQuery] = useState('')
  const dq = useDeferredValue(query)
  const [playing, setPlaying] = useState<Channel | null>(null)
  const u = useUserData()

  useEffect(() => {
    fetch('./data/meta.json').then((r) => r.json()).then((m) => setCountries(m.countries)).catch(() => setErr('Could not load channel data.'))
  }, [])

  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let alive = true
    setChannels([])
    setErr(null)
    loadCountry(country).then((c) => alive && setChannels(c)).catch(() => alive && setErr('Could not load channels for this country.'))
    return () => { alive = false }
  }, [country, attempt])

  const byId = useMemo(() => new Map(channels.map((c) => [c.id, c])), [channels])
  const rows = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g.id, channels.filter((c) => c.g.includes(g.id))])) as Record<string, Channel[]>, [channels])
  const top = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g.id, [...rows[g.id]].sort((a, b) => score(b) - score(a)).slice(0, ROW_LIMIT)])) as Record<string, Channel[]>, [rows])
  const favCh = useMemo(() => u.favs.map((id) => byId.get(id)).filter(Boolean) as Channel[], [u.favs, byId])
  const recent = useMemo(() => u.history.map((h) => byId.get(h.id)).filter(Boolean) as Channel[], [u.history, byId])
  const results = useMemo(() => {
    const q = dq.trim().toLowerCase()
    return q ? channels.filter((c) => c.n.toLowerCase().includes(q) || c.c.some((k) => k.includes(q))) : []
  }, [dq, channels])

  const play = useCallback((c: Channel) => { setPlaying(c); u.addHistory(c.id) }, [u.addHistory])
  const favSet = useMemo(() => new Set(u.favs), [u.favs])
  const tile = (c: Channel, wide?: boolean) => <Tile key={c.id} ch={c} fav={favSet.has(c.id)} onPlay={play} onFav={u.toggleFav} wide={wide} />

  const grid = (list: Channel[], empty: string) =>
    list.length === 0 ? <div className="glass rounded-2xl px-4 py-8 text-center text-white/50">{empty}</div> : (
      <VirtuosoGrid className="thin" style={{ height: '100%' }} totalCount={list.length} overscan={400}
        listClassName="flex flex-wrap gap-4 pb-8" itemContent={(i) => tile(list[i])} />
    )

  const title = (t: string, sub?: string) => <div className="mb-4 flex items-baseline gap-3"><h1 className="text-3xl font-bold">{t}</h1>{sub && <span className="text-white/50">{sub}</span>}</div>
  const nav = (v: View) => { setQuery(''); setView(v) }
  const scroller = useRef<HTMLDivElement>(null)
  const goHome = () => { setQuery(''); setView({ name: 'live' }); scroller.current?.scrollTo({ top: 0, behavior: 'smooth' }) }
  const gridPage = (t: string, list: Channel[], empty: string, sub?: string) => (
    <div className="flex h-full flex-col">{title(t, sub ?? `${list.length} channels`)}<div className="min-h-0 flex-1">{grid(list, empty)}</div></div>
  )

  let content
  if (err) content = <div className="grid h-full place-items-center"><div className="glass rounded-2xl p-8 text-center"><div className="mb-3">{err}</div><button onClick={() => setAttempt((a) => a + 1)} className="rounded-lg bg-[var(--accent)] px-4 py-1.5 font-semibold text-black">Retry</button></div></div>
  else if (!channels.length) content = <div className="space-y-6">{[0, 1, 2].map((i) => <div key={i}><div className="skel mb-3 h-7 w-48 rounded" /><div className="flex gap-4">{Array.from({ length: 5 }, (_, j) => <div key={j} className="skel aspect-video w-56 rounded-2xl" />)}</div></div>)}</div>
  else if (query.trim()) content = gridPage(`Results for “${query.trim()}”`, results, 'No channels match your search.')
  else if (view.name === 'favorites') content = (
    <div className="flex h-full flex-col">{title('Favorites', `${favCh.length} channels`)}
      {favCh.length > 0 && <div className="mb-3"><button onClick={() => u.setFavs([])} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"><Trash2 size={15} /> Remove all</button></div>}
      <div className="min-h-0 flex-1">{grid(favCh, 'No favorites yet. Hover a tile and press the star.')}</div></div>)
  else if (view.name === 'history') content = (
    <div className="flex h-full flex-col">{title('History')}
      <div className="mb-3"><button onClick={() => u.setHistory([])} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"><Trash2 size={15} /> Clear history</button></div>
      <div className="min-h-0 flex-1">{grid(recent, 'Nothing watched yet.')}</div></div>)
  else if (view.name === 'group') { const g = GROUPS.find((x) => x.id === view.g)!; content = gridPage(g.title, [...rows[g.id]].sort((a, b) => score(b) - score(a)), 'No channels.') }
  else content = (
    <div>
            {recent.length > 0 && <Row title="Recently Watched" onMore={recent.length > 5 ? () => nav({ name: 'history' }) : undefined}>{recent.slice(0, ROW_LIMIT).map((c) => tile(c, true))}</Row>}
            {favCh.length > 0 && <Row title="Favorites" onMore={favCh.length > 5 ? () => nav({ name: 'favorites' }) : undefined}>{favCh.slice(0, ROW_LIMIT).map((c) => tile(c))}</Row>}
      {GROUPS.map((g) => top[g.id].length > 0 && <Row key={g.id} title={g.title} onMore={rows[g.id].length > ROW_LIMIT ? () => nav({ name: 'group', g: g.id }) : undefined}>{top[g.id].map((c) => tile(c))}</Row>)}
    </div>
  )

  const scrolls = view.name === 'live' && !query.trim() && !err && channels.length > 0 || !channels.length || !!err
  return (
    <div className="bg-aurora flex h-full">
      <Sidebar view={view} setView={nav} onHome={goHome} countries={countries} country={country} setCountry={(c) => { setCountry(c); setQuery('') }} channels={channels} onPlay={play} playingId={playing?.id} />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar query={query} setQuery={setQuery} />
        <div ref={scroller} className={`thin min-h-0 flex-1 px-8 pb-6 ${scrolls ? 'overflow-y-auto' : 'overflow-hidden'}`}><div key={query.trim() ? 'search' : view.name + (view.name === 'group' ? view.g : '')} className="page h-full">{content}</div></div>
      </main>
      {playing && <Player ch={playing} fav={favSet.has(playing.id)} onFav={() => u.toggleFav(playing.id)} onClose={() => setPlaying(null)} />}
    </div>
  )
}
