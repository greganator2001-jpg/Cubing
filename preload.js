const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  version: () => ipcRenderer.invoke('app:version'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  saveFile: (name, text) => ipcRenderer.invoke('file:save', { name, text }),
  onUpdate: cb => ipcRenderer.on('update', (_e, d) => cb(d))
});
