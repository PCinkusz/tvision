import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown, Menu } from 'lucide-react'
import { AsciiField } from '@/components/AsciiField'
import { AnimatedNumber } from '@/components/motion/animated-number'
import { SharedLayoutBg } from '@/components/motion/shared-layout-bg'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/motion/tabs'
import { TextReveal } from '@/components/motion/text-reveal'
import { initSectionTransitions, refreshSectionTransitions } from '@/lib/sectionTransition03'
import { RELEASES_URL, useRelease, type Release } from './hooks'

const CHANNELS = 2719

const COUNTRIES = [
  { name: 'United States', count: 1581 },
  { name: 'Germany', count: 364 },
  { name: 'Spain', count: 221 },
  { name: 'United Kingdom', count: 188 },
  { name: 'Poland', count: 186 },
  { name: 'France', count: 179 },
]

const QUESTIONS = [
  {
    q: 'Is it free?',
    a: 'Yes. No paid tier, account or ads.',
  },
  {
    q: 'Where do the channels come from?',
    a: 'Public streams from the iptv-org project, played from the broadcasters’ servers.',
  },
  {
    q: 'Does the app collect anything?',
    a: 'No analytics. Favorites and history stay on your computer.',
  },
]

function Key({
  href,
  children,
  primary = false,
  small = false,
  className = '',
  label,
}: {
  href: string
  children: ReactNode
  primary?: boolean
  small?: boolean
  className?: string
  label?: string
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className={`key${primary ? ' key--primary' : ''}${small ? ' key--small' : ''} ${className}`.trim()}
    >
      {children}
    </a>
  )
}

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="TVision, back to top">
      <span className="brand__mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span>TVision</span>
    </a>
  )
}

function Masthead({ rel }: { rel: Release }) {
  const links = [
    ['Inside', '#inside'],
    ['Channels', '#channels'],
    ['Why the warning', '#warning'],
    ['Questions', '#questions'],
  ] as const

  return (
    <>
      <div className="topline">
        <div className="wrap topline__inner">
          <span>2,719 public channels</span>
          <span>Six countries</span>
          <span>
            Checked <time dateTime="2026-10-19">2026-10-19</time>
          </span>
        </div>
      </div>

      <header className="site-head">
        <div className="wrap site-head__bar">
          <Brand />

          <nav className="site-nav" aria-label="Primary">
            <SharedLayoutBg className="site-nav__links" inset={4} pillClassName="rounded-none bg-paper-3">
              {links.map(([label, href]) => (
                <a key={href} className="site-nav__link" href={href}>
                  {label}
                </a>
              ))}
            </SharedLayoutBg>
          </nav>

          <details className="menu site-head__menu">
            <summary aria-label="Open menu">
              <Menu size={18} aria-hidden="true" />
            </summary>
            <div
              className="menu__panel"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a')) {
                  ;(event.currentTarget.parentElement as HTMLDetailsElement).open = false
                }
              }}
            >
              {links.map(([label, href]) => (
                <a key={href} href={href}>
                  {label}
                </a>
              ))}
              <a href={RELEASES_URL}>Releases</a>
            </div>
          </details>

          <div className="site-head__aside">
            <a className="plain" href={RELEASES_URL}>
              Releases
            </a>
            <Key href={rel.url} primary small label="Download TVision for Windows">
              Download
            </Key>
          </div>
        </div>
      </header>
    </>
  )
}

function Hero({ rel }: { rel: Release }) {
  return (
    <section
      className="hero"
      id="top"
      data-st-03="24"
      data-st-spread="4"
      data-st-fill-duration="0.03"
      data-st-cover-start="bottom bottom"
      data-st-mobile-resolution="14"
    >
      <AsciiField className="hero__field" />

      <div className="wrap hero__grid">
        <div className="hero__text">
          <TextReveal
            as="h1"
            text="Six catalogs, one window."
            stagger={0.06}
            blur={8}
            yOffset="22%"
            spring={{ stiffness: 170, damping: 30, mass: 1.1 }}
          />
          <p className="lead hero__lead settle settle--2">
            2,719 public channels from six countries, in one Windows player.
          </p>
          <div className="hero__actions settle settle--3">
            <Key href={rel.url} primary label="Download TVision for Windows">
              Download for Windows
            </Key>
            <Key href="#inside">Look inside</Key>
          </div>
          <dl className="hero__facts settle settle--3">
            <div>
              <dt>Windows</dt>
              <dd>10 and 11, 64-bit</dd>
            </div>
            <div>
              <dt>Account</dt>
              <dd>None</dd>
            </div>
            <div>
              <dt>Updates</dt>
              <dd>Automatic</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>On this PC</dd>
            </div>
          </dl>
        </div>

        <figure className="cut hero__capture settle">
          <figcaption className="capture__bar">
            <span>US catalog</span>
            <span className="mono">1,581 channels / 22:11</span>
          </figcaption>
          <div className="capture__image">
            <img
              src="./shots/home.webp"
              width={1600}
              height={1000}
              alt="The TVision home screen, with live channel previews in recently watched, favorites and sport rows"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </figure>
      </div>
    </section>
  )
}

function Inside() {
  return (
    <section className="section section--band" id="inside">
      <div className="wrap">
        <div className="head">
          <h2>What the player looks like at night.</h2>
          <p>Two captures from the same evening.</p>
        </div>

        <Tabs defaultValue="search" variant="segment" onValueChange={() => requestAnimationFrame(refreshSectionTransitions)}>
          <TabsList className="tabs__list">
            <TabsTrigger value="search" className="tabs__trigger">
              Search
            </TabsTrigger>
            <TabsTrigger value="countries" className="tabs__trigger">
              Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="tabs__panel">
            <div className="inside__panel">
              <figure className="cut capture">
                <figcaption className="capture__bar">
                  <span>Search</span>
                  <span className="mono">58 results / 22:12</span>
                </figcaption>
                <div className="capture__image">
                  <img
                    src="./shots/search.webp"
                    width={1600}
                    height={1000}
                    alt="Search results for the word classic, each channel showing a live frame and its categories"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </figure>
              <div className="inside__caption">
                <h3>58 results, each with a live frame.</h3>
                <p className="dim inside__note">
                  Type a name or a topic. Results fill in as you type, across the whole country.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="countries" className="tabs__panel">
            <div className="inside__panel">
              <figure className="cut capture">
                <figcaption className="capture__bar">
                  <span>Countries</span>
                  <span className="mono">PL / 186 channels / 22:13</span>
                </figcaption>
                <div className="capture__image">
                  <img
                    src="./shots/poland.webp"
                    width={1600}
                    height={1000}
                    alt="TVision showing Polish sport, documentaries, news and movie channels in rows"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </figure>
              <div className="inside__caption">
                <h3>Poland, 186 channels in one click.</h3>
                <p className="dim inside__note">
                  The rows, the search and the sidebar follow the country you choose.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function Failover() {
  return (
    <section className="split">
      <div className="wrap split__grid">
        <div>
          <p className="split__line">When a source stalls, the next one plays.</p>
          <p className="dim split__note">
            Channels often carry several sources. TVision tries the next one without asking.
          </p>
        </div>
        <figure className="cut split__figure">
          <img
            src="./visuals/broadcast-mast.webp"
            width={1024}
            height={768}
            alt="A broadcast mast rising above low cloud at night, rendered for TVision"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>
  )
}

function Channels() {
  return (
    <section
      className="section section--band"
      id="channels"
      data-st-mode="reveal"
      data-st-03="24"
      data-st-spread="5"
      data-st-fill-duration="0.028"
      data-st-fill-color="color-mix(in oklab, var(--color-accent) 30%, var(--color-paper))"
      data-st-layer-height="100%"
      data-st-mobile-resolution="14"
    >
      <div className="wrap">
        <div className="channels__grid">
          <div>
            <p className="channels__number">
              <AnimatedNumber value={CHANNELS} format={(n) => Math.round(n).toLocaleString('en-GB')} />
            </p>
            <p className="channels__unit">public channels across six catalogs</p>
            <p className="channels__date">
              Checked <time dateTime="2026-10-19">2026-10-19</time>
            </p>
          </div>

          <div className="channels__head">
            <h2>Six catalogs, counted.</h2>
          </div>

          <div className="channels__table">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Country</th>
                  <th scope="col">Channels</th>
                </tr>
              </thead>
              <tbody>
                {COUNTRIES.map((country) => (
                  <tr key={country.name} className={country.name === 'United States' ? 'is-current' : undefined}>
                    <td>{country.name}</td>
                    <td className="n">{country.count.toLocaleString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}

function Warning() {
  return (
    <section className="warn" id="warning">
      <AsciiField className="warn__field" />
      <div className="wrap">
        <div className="warn__intro">
          <h2>Why Windows shows a warning</h2>
          <div>
            <p className="warn__lead">
              The installer is not code-signed. SmartScreen cannot confirm the publisher, so it treats the
              download as unrecognized.
            </p>
            <p className="warn__note">That warning is about publisher reputation, not a virus scan.</p>
            <a className="warn__link" href={RELEASES_URL}>
              Releases on GitHub
            </a>
          </div>
        </div>

        <div className="cut cut--graphite warn__card">
          <ol className="steps">
            <li>
              <div>
                <strong>Open the installer.</strong>
                <span>
                  Windows shows <code className="code">Windows protected your PC</code>.
                </span>
              </div>
            </li>
            <li>
              <div>
                <strong>Choose More info.</strong>
                <span>The publisher and file name appear.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Choose Run anyway.</strong>
                <span>The installer starts.</span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  )
}

function Questions() {
  return (
    <section className="section section--hair" id="questions">
      <div className="wrap">
        <div className="head head--tight">
          <h2>The rest of the questions.</h2>
        </div>
        <div className="qa">
          {QUESTIONS.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <ChevronDown className="chev" size={20} aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Close({ rel }: { rel: Release }) {
  return (
    <section className="close" id="download">
      <div className="close__bg" aria-hidden="true">
        <img src="./visuals/perforated-cobalt.webp" alt="" loading="lazy" decoding="async" width={1024} height={768} />
      </div>
      <div className="wrap close__grid">
        <div>
          <h2>Start with the installer.</h2>
          <p className="lead close__lead">Free for Windows 10 and 11. It takes about a minute.</p>
        </div>
        <div className="close__action">
          <Key href={rel.url} primary label="Download TVision for Windows">
            Download for Windows
          </Key>
          <p className="close__note">
            Windows may warn: the installer is unsigned. <a href="#warning">Why the warning appears</a>.
          </p>
          <div className="close__links">
            <a href={RELEASES_URL}>All releases</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__mark">TVision</div>
          <div className="footer__links">
            <a href="#inside">Inside</a>
            <a href="#channels">Channels</a>
            <a href="#warning">Why the warning</a>
            <a href="#questions">Questions</a>
            <a href={RELEASES_URL}>Releases</a>
          </div>
        </div>
        <p className="legal">
          TVision hosts no video. Streams come from the iptv-org project and the broadcasters’ servers.
          Channel names and logos belong to their owners.
        </p>
        <p className="colophon">TVision / 2026</p>
      </div>
    </footer>
  )
}

export default function App() {
  const rel = useRelease()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!mainRef.current) return
    return initSectionTransitions(mainRef.current)
  }, [])

  useEffect(() => {
    if (!window.location.hash) return
    const frame = requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash)
      if (!target) return
      const top = target.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top, left: 0, behavior: 'instant' as ScrollBehavior })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <>
      <a className="skip" href="#top">
        Skip to content
      </a>
      <Masthead rel={rel} />
      <main ref={mainRef}>
        <Hero rel={rel} />
        <Inside />
        <Failover />
        <Channels />
        <Warning />
        <Questions />
        <Close rel={rel} />
      </main>
      <Footer />
    </>
  )
}
