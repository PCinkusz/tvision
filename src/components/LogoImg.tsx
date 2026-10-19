import { useState } from 'react'

// Detects very dark logos (transparent PNG/SVG with black art) and puts them on a light plate so they stay visible.
const lum = new Map<string, boolean>()

export function LogoImg({ src, onFail }: { src: string; onFail: () => void }) {
  const [cors, setCors] = useState(true)
  const [dark, setDark] = useState<boolean>(lum.get(src) ?? false)
  const measure = (img: HTMLImageElement) => {
    if (lum.has(src)) return
    try {
      const c = document.createElement('canvas')
      c.width = c.height = 24
      const x = c.getContext('2d', { willReadFrequently: true })!
      x.drawImage(img, 0, 0, 24, 24)
      const d = x.getImageData(0, 0, 24, 24).data
      let sum = 0
      let n = 0
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 128) {
          sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
          n++
        }
      }
      const isDark = n > 10 && sum / n < 70
      lum.set(src, isDark)
      setDark(isDark)
    } catch {
      lum.set(src, false) // tainted canvas (no CORS): skip detection
    }
  }
  return (
    <div className={`absolute inset-0 m-auto flex h-[62%] w-[62%] items-center justify-center ${dark ? 'rounded-xl bg-white/90 p-2' : ''}`}>
      <img src={src} crossOrigin={cors ? 'anonymous' : undefined} alt="" loading="lazy" draggable={false} onLoad={(e) => measure(e.currentTarget)} onError={() => (cors ? setCors(false) : onFail())} className="max-h-full max-w-full object-contain" />
    </div>
  )
}
