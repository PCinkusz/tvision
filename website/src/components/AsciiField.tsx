import { useEffect, useRef } from 'react'

const GLYPHS = ' .:-=+*#%@'
const COUNTRY_WEIGHTS = [1581, 364, 221, 188, 186, 179]

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/**
 * A cobalt character field built from the six catalogue sizes. It is a still
 * ground, not a loop: the density maps the real channel counts so the texture
 * belongs to this product rather than to a random noise field.
 */
export function AsciiField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let frame = 0
    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)

      const context = canvas.getContext('2d')
      if (!context) return
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, width, height)

      const styles = getComputedStyle(document.documentElement)
      const tints = ['--color-glyph-1', '--color-glyph-2', '--color-glyph-3', '--color-glyph-4'].map(
        (token) => styles.getPropertyValue(token).trim() || 'rgb(70, 90, 130)',
      )

      const cellW = 8
      const cellH = 16
      const columns = Math.ceil(width / cellW)
      const rows = Math.ceil(height / cellH)
      const maxWeight = COUNTRY_WEIGHTS[0]

      context.font = '500 11px "JetBrains Mono", ui-monospace, monospace'
      context.textBaseline = 'top'

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const band = Math.min(COUNTRY_WEIGHTS.length - 1, Math.floor((column / columns) * COUNTRY_WEIGHTS.length))
          const weight = Math.pow(COUNTRY_WEIGHTS[band] / maxWeight, 0.72)
          const wave = 0.5 + 0.5 * Math.sin(column * 0.13 + row * 0.19 + band * 0.9)
          const falloff = 1 - (row / rows) * 0.38
          const density = weight * (0.28 + 0.72 * wave) * falloff

          if (density < 0.12) continue

          const glyphIndex = Math.min(
            GLYPHS.length - 1,
            Math.floor(density * (GLYPHS.length - 1) + hash(column, row) * 1.4),
          )
          if (glyphIndex === 0) continue

          const tintIndex = Math.min(tints.length - 1, Math.floor(density * tints.length))
          context.fillStyle = tints[tintIndex]
          context.globalAlpha = 0.2 + density * 0.62
          context.fillText(GLYPHS[glyphIndex], column * cellW, row * cellH)
        }
      }
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(draw)
    }

    schedule()
    const observer = new ResizeObserver(schedule)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
