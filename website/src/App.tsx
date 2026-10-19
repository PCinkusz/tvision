import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight, Check, ChevronDown, Download, Globe2, History, LayoutGrid, Lock, MousePointerClick, Radio,
  RefreshCw, Search, ShieldCheck, Star, Tv, Zap, MonitorPlay, Wrench,
} from 'lucide-react'
import { RELEASES_URL, useReveal, useRelease, type Release } from './hooks'

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, shown] = useReveal()
  return <div ref={ref} style={{ ['--d' as string]: `${delay}ms` }} className={`reveal ${shown ? 'in' : ''} ${className}`}>{children}</div>
}

function Logo({ size = 36 }: { size?: number }) {
  return <img src="./icon.png" width={size} height={size} alt="" className="rounded-[22%]" />
}

function DownloadButton({ rel, big }: { rel: Release; big?: boolean }) {
  return (
    <a href={rel.url} className={`btn-primary inline-flex items-center gap-3 rounded-full ${big ? 'px-8 py-4 text-lg' : 'px-5 py-2.5 text-sm'}`}>
      <Download size={big ? 22 : 17} strokeWidth={2.5} />
      <span className="flex flex-col text-left leading-tight">
        <span>Download for Windows</span>
        {big && (rel.version || rel.size) && <span className="text-xs font-semibold opacity-70">{[rel.version && `v${rel.version}`, rel.size].filter(Boolean).join(' · ')}</span>}
      </span>
    </a>
  )
}

function Nav({ rel }: { rel: Release }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const links = [['Features', '#features'], ['Showcase', '#showcase'], ['Countries', '#countries'], ['FAQ', '#faq']]
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-[#080c18]/80 backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <a href="#top" className="group flex items-center gap-3">
          <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"><Logo /></span>
          <span className="text-xl font-bold tracking-tight">TVision</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([l, h]) => (
            <a key={h} href={h} className="relative text-sm text-white/65 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[var(--color-accent)] after:transition-all hover:after:w-full">{l}</a>
          ))}
        </nav>
        <DownloadButton rel={rel} />
      </div>
    </header>
  )
}

function AppWindow({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/15 bg-[#0b1020] shadow-[0_40px_120px_-30px_rgba(45,226,208,0.35),0_30px_80px_-40px_rgba(124,92,255,0.6)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#0e1426] px-4 py-2.5">
        <Logo size={16} />
        <span className="text-xs font-medium text-white/60">TVision</span>
        <span className="ml-auto flex gap-4 text-white/40" aria-hidden>
          <span className="h-px w-3 translate-y-2 bg-current" /><span className="h-2.5 w-2.5 border border-current" /><span className="relative h-3 w-3 before:absolute before:left-1/2 before:top-0 before:h-3 before:w-px before:rotate-45 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-3 after:w-px after:-rotate-45 after:bg-current" />
        </span>
      </div>
      <img src={src} alt={alt} loading="lazy" width={1600} height={1000} className="block h-auto w-full" />
    </div>
  )
}

function Hero({ rel }: { rel: Release }) {
  return (
    <section id="top" className="relative overflow-hidden px-6 pb-24 pt-36 md:pt-44">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="drift absolute -left-32 top-10 h-[480px] w-[480px] rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
        <div className="drift absolute -right-24 top-40 h-[520px] w-[520px] rounded-full bg-[var(--color-violet)]/30 blur-[130px] [animation-delay:-6s]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      </div>
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-white/80">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent)]" /> Free live TV player for Windows
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-7 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Live TV from six countries.<br /><span className="grad-text">Beautifully organized.</span>
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65 md:text-xl">
            TVision turns thousands of public channels into a fast, Netflix-style experience. See what's on right now, jump between categories, and press play. No accounts, no clutter.
          </p>
        </Reveal>
        <Reveal delay={240} className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <DownloadButton rel={rel} big />
          <a href="#showcase" className="btn-ghost glass inline-flex items-center gap-2 rounded-full px-7 py-4 text-lg">See it in action <ArrowRight size={18} /></a>
        </Reveal>
        <Reveal delay={300}><p className="mt-5 text-sm text-white/40">Windows 10 / 11 · 64-bit</p></Reveal>
      </div>
      <Reveal delay={200} className="mx-auto mt-16 max-w-5xl">
        <div className="float"><AppWindow src="./shots/home.webp" alt="TVision home screen with Recently Watched, Favorites and Sport rows showing live channel previews" /></div>
      </Reveal>
    </section>
  )
}

function Stats() {
  const items = [['2,700+', 'Channels'], ['6', 'Countries'], ['0', 'Accounts needed'], ['100%', 'Stored on your device']]
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-6 py-12 md:grid-cols-4">
        {items.map(([n, l], i) => (
          <Reveal key={l} delay={i * 80} className="text-center">
            <div className="grad-text text-4xl font-extrabold md:text-5xl">{n}</div>
            <div className="mt-1 text-sm text-white/55">{l}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

const FEATURES = [
  { Icon: Radio, t: 'Live previews on every tile', d: 'Tiles show a real frame of what is on right now, not just a logo. You know what you are about to watch before you click.' },
  { Icon: MousePointerClick, t: 'Hover to peek', d: 'Rest your cursor on a channel and a muted live preview starts playing. Move away and it stops.' },
  { Icon: LayoutGrid, t: 'Categories that make sense', d: 'Sport, documentaries and history, news, movies and series, entertainment. A handful of focused rows instead of a wall of thousands.' },
  { Icon: Search, t: 'Instant search', d: 'Type a name or a topic and the results appear as you type, across the whole country list.' },
  { Icon: Star, t: 'Favorites and history', d: 'Star the channels you love. Recently watched and favorites rows appear on your home screen as soon as you have some.' },
  { Icon: RefreshCw, t: 'Automatic failover', d: 'Channels often have several sources. If one stops responding, TVision quietly tries the next instead of leaving you staring at a spinner.' },
  { Icon: Zap, t: 'Fast with huge lists', d: 'Long lists are virtualized and previews load only for what is on screen, so the app opens instantly and stays smooth.' },
  { Icon: Wrench, t: 'Plays tricky streams', d: 'The desktop app handles streams that browsers refuse to play, so more of the catalog works than in a web player.' },
  { Icon: ShieldCheck, t: 'Private by design', d: 'No sign-up and no tracking. Your favorites and history never leave your computer.' },
]

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">Features</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Everything a TV player should be</h2>
        <p className="mt-4 text-lg text-white/60">Designed around one idea: finding something good to watch should take seconds.</p>
      </Reveal>
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ Icon, t, d }, i) => (
          <Reveal key={t} delay={(i % 3) * 90}>
            <div className="glass card-hover h-full rounded-2xl p-7">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-accent)]/25 to-[var(--color-violet)]/25 text-[var(--color-accent)] ring-1 ring-white/10"><Icon size={24} /></div>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 leading-relaxed text-white/60">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Showcase() {
  const rows = [
    { tag: 'Home', t: 'Everything you watch, one scroll away', d: 'Your recently watched channels and favorites sit at the top, followed by curated rows for sport, documentaries, news, movies and entertainment. Every row scrolls sideways, just like the streaming apps you know.', pts: ['Rows scroll with arrows, drag or touchpad', 'See all opens a full grid for any category', 'Rows only appear when they have something to show'], src: './shots/home.webp', alt: 'TVision home screen' },
    { tag: 'Search', t: 'Find any channel in a keystroke', d: 'Search by channel name or topic. Results show live previews so you can tell at a glance whether a channel is what you are looking for.', pts: ['Results update as you type', 'Works across the full catalog of your country', 'Live frames on every result'], src: './shots/search.webp', alt: 'TVision search results for the word classic' },
    { tag: 'Countries', t: 'Switch countries in one click', d: 'Watch local TV from the US, Spain, Germany, France, the UK or Poland. The channel list and every row follow the country you pick.', pts: ['Full channel list in the sidebar with logos', 'Green dots mark sources that passed a recent check', 'Your choice is remembered'], src: './shots/poland.webp', alt: 'TVision showing Polish channels' },
  ]
  return (
    <section id="showcase" className="relative bg-white/[0.02] py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">Showcase</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">A closer look</h2>
        </Reveal>
        <div className="mt-20 space-y-28">
          {rows.map((r, i) => (
            <div key={r.tag} className="grid items-center gap-12 lg:grid-cols-5">
              <Reveal className={`lg:col-span-2 ${i % 2 ? 'lg:order-2' : ''}`}>
                <span className="glass rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">{r.tag}</span>
                <h3 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{r.t}</h3>
                <p className="mt-4 text-lg leading-relaxed text-white/60">{r.d}</p>
                <ul className="mt-6 space-y-3">
                  {r.pts.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-white/80"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]"><Check size={13} strokeWidth={3} /></span>{p}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={120} className={`lg:col-span-3 ${i % 2 ? 'lg:order-1' : ''}`}><AppWindow src={r.src} alt={r.alt} /></Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { Icon: Download, t: 'Download and install', d: 'Grab the installer and run it. It takes under a minute and updates itself afterwards.' },
    { Icon: Globe2, t: 'Pick your country', d: 'Choose from six countries. TVision loads only that list, so it opens fast.' },
    { Icon: MonitorPlay, t: 'Press play', d: 'Click any tile. If a source is down, the next one starts automatically.' },
  ]
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">How it works</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Watching in three steps</h2>
      </Reveal>
      <div className="relative mt-16 grid gap-6 md:grid-cols-3">
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block" aria-hidden />
        {steps.map(({ Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 120} className="text-center">
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-violet)] text-[#04101a] shadow-[0_16px_40px_-12px_rgba(45,226,208,.6)]">
              <Icon size={32} strokeWidth={2.2} />
              <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-white/20 bg-[#0b1020] text-sm font-bold text-white">{i + 1}</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold">{t}</h3>
            <p className="mx-auto mt-2 max-w-xs text-white/60">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

const COUNTRIES = [['US', 'United States', '1,581'], ['ES', 'Spain', '221'], ['DE', 'Germany', '364'], ['FR', 'France', '179'], ['UK', 'United Kingdom', '188'], ['PL', 'Poland', '186']]

function Countries() {
  return (
    <section id="countries" className="bg-white/[0.02] py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">Countries</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Six countries, done properly</h2>
          <p className="mt-4 text-lg text-white/60">Focused on a few markets so each one feels complete, not a dump of every channel on earth.</p>
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {COUNTRIES.map(([code, name, n], i) => (
            <Reveal key={code} delay={(i % 3) * 80}>
              <div className="glass card-hover flex items-center gap-4 rounded-2xl p-5">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-accent)]/25 to-[var(--color-violet)]/25 text-lg font-extrabold ring-1 ring-white/10">{code}</span>
                <div><div className="font-semibold">{name}</div><div className="text-sm text-white/50">{n} channels</div></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  ['Is TVision free?', 'TVision is free to download and use.'],
  ['Where do the channels come from?', 'The channel list comes from the open iptv-org community project, which collects links to streams that broadcasters have made publicly available. TVision does not host or re-stream any video. It plays the streams directly from their original sources.'],
  ['Why do some channels not play?', 'Public streams go offline, move or are restricted to certain regions. TVision checks the list regularly, shows the sources that responded first, and automatically tries another source if one fails. A few channels may still be unavailable at any given moment.'],
  ['Windows says "Windows protected your PC". Is it safe?', 'The installer is not code-signed yet, so Windows SmartScreen shows a warning for new apps. Click "More info", then "Run anyway". Signing is planned for a later release.'],
  ['Do you collect my data?', 'No. There are no accounts and no analytics in the app. Your favorites and watch history are stored only on your computer.'],
  ['Which systems are supported?', 'Windows 10 and 11, 64-bit. Other platforms are not available yet.'],
  ['How do updates work?', 'TVision checks for new versions on startup and installs them for you.'],
]

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-28">
      <Reveal className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)]">FAQ</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Questions, answered</h2>
      </Reveal>
      <div className="mt-12 space-y-3">
        {FAQS.map(([q, a], i) => (
          <Reveal key={q} delay={i * 40}>
            <details className="glass group rounded-2xl transition-colors open:bg-white/[0.07] hover:border-white/25">
              <summary className="flex items-center justify-between gap-4 px-6 py-5 text-lg font-medium">
                {q}<ChevronDown className="chev shrink-0 text-white/50 transition-transform duration-300" size={20} />
              </summary>
              <p className="px-6 pb-6 leading-relaxed text-white/60">{a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Cta({ rel }: { rel: Release }) {
  return (
    <section id="download" className="px-6 pb-28">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 px-8 py-20 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--color-accent)]/25 via-[#0b1020] to-[var(--color-violet)]/35" aria-hidden />
          <div className="absolute -top-24 left-1/2 -z-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-white/10 blur-[90px]" aria-hidden />
          <div className="mx-auto mb-6 w-fit"><Logo size={64} /></div>
          <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">Start watching in a minute</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">Download TVision for Windows and get live TV from six countries, organized the way it should be.</p>
          <div className="mt-9"><DownloadButton rel={rel} big /></div>
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left text-sm text-white/65 sm:grid-cols-3">
            {['Windows 10 / 11, 64-bit', 'No account required', 'Updates itself'].map((t) => <div key={t} className="flex items-center gap-2"><Check size={16} className="text-[var(--color-accent)]" strokeWidth={3} />{t}</div>)}
          </div>
          <p className="mx-auto mt-8 flex max-w-xl items-start justify-center gap-2 text-xs leading-relaxed text-white/50"><Lock size={14} className="mt-0.5 shrink-0" />The installer is not code-signed yet. If Windows shows "Windows protected your PC", choose More info, then Run anyway.</p>
          <a href={RELEASES_URL} className="mt-4 inline-block text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">All versions</a>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-3"><Logo size={32} /><span className="text-lg font-bold">TVision</span></div>
          <div className="flex gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white">Features</a><a href="#countries" className="hover:text-white">Countries</a><a href="#faq" className="hover:text-white">FAQ</a><a href={RELEASES_URL} className="hover:text-white">Downloads</a>
          </div>
        </div>
        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-white/40">
          TVision does not host, store or distribute any video content. It plays publicly available streams listed by the iptv-org community project, directly from the broadcasters' own servers. Channel names, logos and images belong to their respective owners, and TVision is not affiliated with or endorsed by any of them. Availability of individual channels depends on the broadcasters.
        </p>
        <p className="mt-4 text-xs text-white/30">© {new Date().getFullYear()} TVision</p>
      </div>
    </footer>
  )
}

export default function App() {
  const rel = useRelease()
  return (
    <>
      <Nav rel={rel} />
      <main>
        <Hero rel={rel} />
        <Stats />
        <Features />
        <Showcase />
        <HowItWorks />
        <Countries />
        <Faq />
        <Cta rel={rel} />
      </main>
      <Footer />
    </>
  )
}
