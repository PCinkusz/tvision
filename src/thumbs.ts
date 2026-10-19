import Hls from 'hls.js'
import type { Channel } from './types'

// Lazy, throttled frame capture. Works when the stream is CORS-readable (always in the Electron app).
const TTL = 15 * 60 * 1000, MAX_PARALLEL = 2, TIMEOUT = 9000
const mem = new Map<string, string>()
const failed = new Map<string, number>()
let running = 0
const queue: { ch: Channel; res: (v: string | null) => void; cancelled: () => boolean }[] = []

function db(): Promise<IDBDatabase> {
  return new Promise((res, rej) => { const r = indexedDB.open('thumbs', 1); r.onupgradeneeded = () => r.result.createObjectStore('t'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
}
async function idbGet(id: string): Promise<{ d: string; t: number } | undefined> {
  try { const d = await db(); return await new Promise((res) => { const q = d.transaction('t').objectStore('t').get(id); q.onsuccess = () => res(q.result); q.onerror = () => res(undefined) }) } catch { return undefined }
}
async function idbPut(id: string, v: { d: string; t: number }) { try { (await db()).transaction('t', 'readwrite').objectStore('t').put(v, id) } catch { /* ignore */ } }
export async function clearThumbs() { mem.clear(); failed.clear(); try { (await db()).transaction('t', 'readwrite').objectStore('t').clear() } catch { /* ignore */ } }

function capture(ch: Channel): Promise<string | null> {
  return new Promise((resolve) => {
    const s = ch.s[0]
    if (!s) return resolve(null)
    ;(window as any).iptv?.setStreamHeaders({ url: s.u, referer: s.r, ua: s.a })
    const v = document.createElement('video')
    v.muted = true; v.crossOrigin = 'anonymous'; v.playsInline = true
    let hls: Hls | null = null, done = false
    const finish = (r: string | null) => { if (done) return; done = true; clearTimeout(to); hls?.destroy(); v.removeAttribute('src'); v.load(); resolve(r) }
    const to = setTimeout(() => finish(null), TIMEOUT)
    const grab = () => {
      try {
        if (!v.videoWidth) return
        const c = document.createElement('canvas'); c.width = 320; c.height = Math.round((320 * v.videoHeight) / v.videoWidth) || 180
        c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
        finish(c.toDataURL('image/jpeg', 0.6))
      } catch { finish(null) }
    }
    v.addEventListener('loadeddata', () => setTimeout(grab, 300))
    v.addEventListener('error', () => finish(null))
    if (Hls.isSupported()) {
      hls = new Hls({ startLevel: 0, maxBufferLength: 4, maxMaxBufferLength: 6, capLevelToPlayerSize: true, manifestLoadingTimeOut: 6000, manifestLoadingMaxRetry: 0, levelLoadingMaxRetry: 0, fragLoadingMaxRetry: 1 })
      hls.on(Hls.Events.ERROR, (_e, d) => { if (d.fatal) finish(null) })
      hls.loadSource(s.u); hls.attachMedia(v)
    } else v.src = s.u
    v.play().catch(() => { /* autoplay blocked is fine, loadeddata still fires */ })
  })
}

function pump() {
  while (running < MAX_PARALLEL && queue.length) {
    const job = queue.pop()! // newest (currently visible) first
    if (job.cancelled()) { job.res(null); continue }
    running++
    capture(job.ch).then(async (d) => {
      if (d) { mem.set(job.ch.id, d); idbPut(job.ch.id, { d, t: Date.now() }) } else failed.set(job.ch.id, Date.now())
      job.res(d)
    }).finally(() => { running--; pump() })
  }
}

export async function getThumb(ch: Channel, cancelled: () => boolean): Promise<string | null> {
  if (mem.has(ch.id)) return mem.get(ch.id)!
  const f = failed.get(ch.id); if (f && Date.now() - f < TTL) return null
  const c = await idbGet(ch.id)
  if (c && Date.now() - c.t < TTL) { mem.set(ch.id, c.d); return c.d }
  if (cancelled()) return null
  return new Promise((res) => { queue.push({ ch, res, cancelled }); pump() })
}
