const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let win;
const send = (ch, data) => { if (win && !win.isDestroyed()) win.webContents.send(ch, data); };

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 900, minWidth: 420, minHeight: 600,
    backgroundColor: '#f3f4f1', title: 'Last Layer Lab', icon: path.join(__dirname, '..', 'app', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, '..', 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.key === 'F11')) { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    if (input.type === 'keyDown' && input.control && input.shift && input.key.toLowerCase() === 'i') { win.webContents.toggleDevTools(); }
  });
}

// ---- updates (GitHub Releases) ----
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on('checking-for-update', () => send('update', { state: 'checking' }));
autoUpdater.on('update-not-available', () => send('update', { state: 'none' }));
autoUpdater.on('update-available', i => send('update', { state: 'downloading', version: i.version, percent: 0 }));
autoUpdater.on('download-progress', p => send('update', { state: 'downloading', percent: Math.round(p.percent) }));
autoUpdater.on('update-downloaded', i => send('update', { state: 'ready', version: i.version }));
autoUpdater.on('error', err => send('update', { state: 'error', message: String(err && err.message || err).split('\n')[0] }));
function check() { if (app.isPackaged) autoUpdater.checkForUpdates().catch(() => {}); else send('update', { state: 'dev' }); }

ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('update:check', () => { check(); return true; });
ipcMain.handle('update:install', () => { setImmediate(() => autoUpdater.quitAndInstall(false, true)); return true; });

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    createWindow();
    win.webContents.once('did-finish-load', () => setTimeout(check, 3000));
    setInterval(check, 4 * 60 * 60 * 1000);
  });
  app.on('window-all-closed', () => app.quit());
}
