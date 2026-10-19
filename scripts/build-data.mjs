// Builds small per-country JSON files from the iptv-org API.
// Usage: node scripts/build-data.mjs [--check]   (--check probes streams, ~2-4 min)
import fs from 'node:fs'
const API = 'https://iptv-org.github.io/api/'
const COUNTRIES = ['US', 'ES', 'DE', 'FR', 'UK', 'PL']
const CHECK = process.argv.includes('--check')
const GROUPS = {
  sports: ['sports'],
  docs: ['documentary', 'science', 'education', 'classic'],
  news: ['news'],
  movies: ['movies', 'series'],
  entertainment: ['entertainment', 'comedy'],
}
const get = (n) => fetch(API + n + '.json').then((r) => r.json())
const [channels, streams, logos, blocklist, countries] = await Promise.all(
  ['channels', 'streams', 'logos', 'blocklist', 'countries'].map(get))

const blocked = new Set(blocklist.map((b) => b.channel))
const chMap = new Map(channels.map((c) => [c.id, c]))
const logoBy = new Map()
for (const l of logos) {
  const cur = logoBy.get(l.channel)
  const score = (x) => (x.in_use ? 4 : 0) + (x.feed === null ? 2 : 0) + (['PNG', 'SVG', 'WebP'].includes(x.format) ? 1 : 0)
  if (!cur || score(l) > score(cur)) logoBy.set(l.channel, l)
}

const byChannel = new Map()
for (const s of streams) {
  const c = chMap.get(s.channel)
  if (!c || !COUNTRIES.includes(c.country) || c.closed || c.is_nsfw || blocked.has(c.id)) continue
  if (!byChannel.has(c.id)) byChannel.set(c.id, [])
  byChannel.get(c.id).push(s)
}

// Health check
const health = new Map() // url -> 'ok' | 'dead' | 'fail'
if (CHECK) {
  const all = [...byChannel.values()].flat()
  let i = 0
  const worker = async () => {
    while (i < all.length) {
      const s = all[i++]
      try {
        const r = await fetch(s.url, {
          signal: AbortSignal.timeout(7000),
          headers: { ...(s.user_agent && { 'User-Agent': s.user_agent }), ...(s.referrer && { Referer: s.referrer }) },
        })
        const t = r.ok ? (await r.text()).slice(0, 200) : ''
        health.set(s.url, r.ok && t.includes('#EXTM3U') ? 'ok' : r.status === 404 || r.status === 410 ? 'dead' : 'fail')
      } catch (e) {
        health.set(s.url, e.cause?.code === 'ENOTFOUND' ? 'dead' : 'fail')
      }
      if (i % 500 === 0) console.log('checked', i, '/', all.length)
    }
  }
  await Promise.all(Array.from({ length: 40 }, worker))
}

const rank = { ok: 0, fail: 1, dead: 2, undefined: 1 }
const out = Object.fromEntries(COUNTRIES.map((c) => [c, []]))
for (const [id, ss] of byChannel) {
  const c = chMap.get(id)
  let list = ss
  if (CHECK) list = ss.filter((s) => health.get(s.url) !== 'dead')
  if (!list.length) continue
  list.sort((a, b) => rank[health.get(a.url)] - rank[health.get(b.url)])
  const groups = Object.keys(GROUPS).filter((g) => c.categories.some((k) => GROUPS[g].includes(k)))
  out[c.country].push({
    id, n: c.name, l: logoBy.get(id)?.url ?? null, c: c.categories, g: groups,
    s: list.slice(0, 4).map((s) => ({ u: s.url, q: s.quality, ...(s.referrer && { r: s.referrer }), ...(s.user_agent && { a: s.user_agent }), ...(CHECK && { h: health.get(s.url) === 'ok' ? 1 : 0 }) })),
  })
}
fs.mkdirSync('public/data', { recursive: true })
const meta = { generated: new Date().toISOString(), checked: CHECK, countries: [] }
for (const cc of COUNTRIES) {
  out[cc].sort((a, b) => a.n.localeCompare(b.n))
  fs.writeFileSync(`public/data/${cc}.json`, JSON.stringify(out[cc]))
  const info = countries.find((x) => x.code === cc)
  meta.countries.push({ code: cc, name: info?.name ?? cc, flag: info?.flag ?? '', count: out[cc].length })
  console.log(cc, out[cc].length, (fs.statSync(`public/data/${cc}.json`).size / 1024).toFixed(0) + ' KB')
}
fs.writeFileSync('public/data/meta.json', JSON.stringify(meta))
