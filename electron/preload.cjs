const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('iptv', { setStreamHeaders: (p) => ipcRenderer.send('stream-headers', p), isElectron: true })
