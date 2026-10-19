const { app, BrowserWindow, session, ipcMain, shell, protocol, net } = require('electron')
const { pathToFileURL } = require('url')
const path = require('path')

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, supportFetchAPI: true, stream: true } }])

// url -> {referer, ua}; registered by the renderer before playing a stream
const headerRules = new Map()
const keyOf = (u) => { try { const x = new URL(u); return x.origin + x.pathname.replace(/[^/]*$/, '') } catch { return u } }

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 860, minWidth: 900, minHeight: 600, backgroundColor: '#0a0e1a', title: 'TVision', icon: path.join(__dirname, '../build/icon.png'), autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, allowRunningInsecureContent: true },
  })
  if (process.env.VITE_DEV) win.loadURL('http://localhost:5173')
  else win.loadURL('app://local/index.html')
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
}

app.whenReady().then(() => {
  protocol.handle('app', (req) => {
    const p = decodeURIComponent(new URL(req.url).pathname)
    const file = path.normalize(path.join(__dirname, '../dist', p === '/' ? 'index.html' : p))
    if (!file.startsWith(path.join(__dirname, '../dist'))) return new Response('forbidden', { status: 403 })
    return net.fetch(pathToFileURL(file).toString())
  })
  const ses = session.defaultSession
  // Apply per-stream Referer / User-Agent (match by directory of the registered stream URL)
  ses.webRequest.onBeforeSendHeaders((d, cb) => {
    const rule = headerRules.get(keyOf(d.url))
    if (rule) {
      if (rule.referer) d.requestHeaders['Referer'] = rule.referer
      if (rule.ua) d.requestHeaders['User-Agent'] = rule.ua
    }
    cb({ requestHeaders: d.requestHeaders })
  })
  // Allow cross-origin media reads (needed for hls.js + frame capture)
  ses.webRequest.onHeadersReceived((d, cb) => {
    if (d.resourceType === 'media' || d.resourceType === 'xhr' || d.resourceType === 'image' || d.resourceType === 'other') {
      const h = { ...d.responseHeaders }
      for (const k of Object.keys(h)) if (k.toLowerCase().startsWith('access-control-')) delete h[k]
      h['Access-Control-Allow-Origin'] = ['*']
      h['Access-Control-Allow-Headers'] = ['*']
      h['Access-Control-Allow-Methods'] = ['GET, HEAD, OPTIONS']
      return cb({ responseHeaders: h, statusLine: d.statusCode === 0 || (d.method === 'OPTIONS') ? 'HTTP/1.1 200 OK' : d.statusLine })
    }
    cb({ responseHeaders: d.responseHeaders })
  })
  ipcMain.on('stream-headers', (_e, { url, referer, ua }) => { headerRules.set(keyOf(url), { referer, ua }) })
  createWindow()
  if (app.isPackaged) {
    try {
      const { autoUpdater } = require('electron-updater')
      autoUpdater.on('error', () => {})
      autoUpdater.checkForUpdatesAndNotify().catch(() => {})
    } catch { /* updater optional */ }
  }
})
app.on('window-all-closed', () => app.quit())
