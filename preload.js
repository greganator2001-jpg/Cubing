const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  version: () => ipcRenderer.invoke('app:version'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  setBusy: on => ipcRenderer.invoke('timer:busy', !!on),
  saveFile: (name, text) => ipcRenderer.invoke('file:save', { name, text }),
  saveBinary: (name, bytes) => ipcRenderer.invoke('file:saveBin', { name, bytes }),
  onBtDevices: cb => ipcRenderer.on('bt:devices', (_e, d) => cb(d)),
  chooseBt: id => ipcRenderer.invoke('bt:choose', id),
  syncPick: () => ipcRenderer.invoke('sync:pick'),
  syncRead: dir => ipcRenderer.invoke('sync:read', dir),
  syncWrite: (dir, text) => ipcRenderer.invoke('sync:write', { dir, text }),
  syncWatch: dir => ipcRenderer.invoke('sync:watch', dir),
  onSyncChanged: cb => ipcRenderer.on('sync:changed', () => cb()),
  onUpdate: cb => ipcRenderer.on('update', (_e, d) => cb(d))
});
