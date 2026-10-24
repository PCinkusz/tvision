import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface SectionTransitionConfig {
  resolution?: number
  spread?: number
  fillDuration?: number
  layerHeight?: string | number
  mode?: 'cover' | 'reveal'
  coverStart?: string
  revealStart?: string
  fillColor?: string
  mobile?: {
    breakpoint?: number
    resolution?: number
  }
}

const DEFAULT_CONFIG = {
  resolution: 20,
  spread: 5,
  fillDuration: 0.03,
  layerHeight: '64vh',
  mode: 'cover' as const,
  coverStart: 'bottom bottom+=20%',
  revealStart: 'top bottom',
  mobile: {
    breakpoint: 768,
  },
}

const isScope = (value: unknown): value is Element | Document =>
  value instanceof Element || value instanceof Document

const getPositiveInt = (value: string | number | null | undefined, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const getPositiveFloat = (value: string | number | null | undefined, fallback: number) => {
  const parsed = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const getCssSize = (value: string | number | undefined, fallback: string) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return `${value}px`
  if (typeof value === 'string' && value.trim()) return value.trim()
  return fallback
}

const isTransparentColor = (value: string) =>
  value === 'transparent' || value === 'rgba(0, 0, 0, 0)' || value === 'rgba(0,0,0,0)' || !value

const resolveFillColor = (sibling: HTMLElement) => {
  const candidates: (Element | null)[] = [
    sibling,
    sibling.parentElement,
    document.body,
    document.documentElement,
  ]

  for (const element of candidates) {
    if (!element) continue
    const background = getComputedStyle(element).backgroundColor
    if (!isTransparentColor(background)) return background
  }

  return getComputedStyle(document.body).backgroundColor
}

const hash = (index: number) => {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function createPixelLayer(
  section: HTMLElement,
  columnCount: number,
  fillColor: string,
  layerHeight: string,
  startVisible: boolean,
) {
  const computed = getComputedStyle(section)
  const previous = {
    position: section.style.position,
    isolation: section.style.isolation,
    overflow: section.style.overflow,
  }

  if (computed.position === 'static') section.style.position = 'relative'
  if (computed.isolation !== 'isolate') section.style.isolation = 'isolate'
  if (!['hidden', 'clip'].includes(computed.overflow)) section.style.overflow = 'hidden'

  const layer = document.createElement('div')
  layer.setAttribute('data-st-03-pixels', '')
  layer.setAttribute('aria-hidden', 'true')
  Object.assign(layer.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    bottom: '0',
    top: 'auto',
    height: layerHeight,
    zIndex: '4',
    pointerEvents: 'none',
  })
  section.append(layer)

  const layerWidth = layer.offsetWidth
  const layerHeightPx = layer.offsetHeight
  const cellSize = layerWidth / columnCount
  const rowCount = Math.max(Math.ceil(layerHeightPx / Math.max(cellSize, 1)), 1)

  Object.assign(layer.style, {
    display: 'grid',
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
  })

  const totalCells = columnCount * rowCount
  const cells = Array.from({ length: totalCells }, () => {
    const cell = document.createElement('span')
    cell.setAttribute('data-st-03-cell', '')
    Object.assign(cell.style, {
      display: 'block',
      width: '100%',
      height: '100%',
      backgroundColor: fillColor,
      backfaceVisibility: 'hidden',
    })
    layer.append(cell)
    return cell
  })

  gsap.set(cells, { opacity: startVisible ? 1 : 0 })

  const restore = () => {
    section.style.position = previous.position
    section.style.isolation = previous.isolation
    section.style.overflow = previous.overflow
  }

  return { layer, cells, rows: rowCount, columns: columnCount, restore }
}

/**
 * Pixelated section handoff. Cover marks the outgoing section and fills with
 * the next section's background; reveal marks the incoming section and fades
 * the previous section's colour away.
 */
export function sectionTransition03(
  scopeOrConfig: Element | Document | SectionTransitionConfig = document,
  maybeConfig: SectionTransitionConfig = {},
) {
  const config: Required<Omit<SectionTransitionConfig, 'fillColor'>> & { fillColor?: string } = {
    ...DEFAULT_CONFIG,
    ...(isScope(scopeOrConfig) ? maybeConfig : (scopeOrConfig as SectionTransitionConfig)),
    mobile: {
      ...DEFAULT_CONFIG.mobile,
      ...((isScope(scopeOrConfig) ? maybeConfig : (scopeOrConfig as SectionTransitionConfig)).mobile || {}),
    },
  }

  const scope = isScope(scopeOrConfig) ? scopeOrConfig : document
  const isMobile = window.matchMedia(`(max-width: ${config.mobile.breakpoint}px)`).matches
  const cleanups: (() => void)[] = []

  scope.querySelectorAll<HTMLElement>('[data-st-03]').forEach((section) => {
    const mode = section.dataset.stMode === 'reveal' ? 'reveal' : config.mode
    const sibling = mode === 'reveal' ? section.previousElementSibling : section.nextElementSibling
    if (!(sibling instanceof HTMLElement)) return

    const desktopResolution = getPositiveInt(section.getAttribute('data-st-03'), config.resolution)
    const resolution = isMobile
      ? getPositiveInt(section.dataset.stMobileResolution, config.mobile.resolution ?? desktopResolution)
      : desktopResolution

    const spread = getPositiveInt(section.dataset.stSpread, config.spread)
    const fillDuration = getPositiveFloat(section.dataset.stFillDuration, config.fillDuration)
    const fillColor = section.dataset.stFillColor || config.fillColor || resolveFillColor(sibling)
    const layerHeight = getCssSize(
      section.dataset.stLayerHeight,
      getCssSize(config.layerHeight, DEFAULT_CONFIG.layerHeight),
    )
    const startVisible = mode === 'reveal'
    const { layer, cells, rows, columns, restore } = createPixelLayer(
      section,
      resolution,
      fillColor,
      layerHeight,
      startVisible,
    )

    const maxDelay = Math.max(rows - 1 + spread, 1)
    const cellDelays = cells.map((_, index) => {
      const row = Math.floor(index / columns)
      // Cover fills from the bottom; reveal uncovers from the top so the
      // pixel edge stays visible as the incoming section enters.
      const rowFromEdge = mode === 'reveal' ? row : rows - 1 - row
      return (rowFromEdge + hash(index) * spread) / maxDelay
    })

    const start =
      mode === 'reveal'
        ? section.dataset.stRevealStart || config.revealStart
        : section.dataset.stCoverStart || config.coverStart

    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start,
        end: () => `+=${Math.max(layer.offsetHeight, 1)}`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })

    timeline.to(
      cells,
      {
        duration: fillDuration,
        opacity: startVisible ? 0 : 1,
        stagger: (index: number) => cellDelays[index],
      },
      0,
    )

    cleanups.push(() => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
      layer.remove()
      restore()
    })
  })

  return () => cleanups.forEach((cleanup) => cleanup())
}

export function initSectionTransitions(scope: HTMLElement) {
  const media = gsap.matchMedia()
  const common: SectionTransitionConfig = {
    resolution: 20,
    spread: 5,
    fillDuration: 0.03,
    layerHeight: '64vh',
    mobile: { breakpoint: 768, resolution: 14 },
  }

  media.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () =>
    sectionTransition03(scope, common),
  )
  media.add('(max-width: 768px) and (prefers-reduced-motion: no-preference)', () =>
    sectionTransition03(scope, { ...common, resolution: 14 }),
  )

  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh)
  if (document.fonts) void document.fonts.ready.then(refresh)
  refresh()

  return () => {
    window.removeEventListener('load', refresh)
    media.revert()
  }
}

export const refreshSectionTransitions = () => ScrollTrigger.refresh()
