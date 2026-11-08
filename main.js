const { app, BrowserWindow, ipcMain, shell, Menu, dialog, powerSaveBlocker } = require('electron');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let win;
// Web Bluetooth (smart cubes): read the MAC from advertisements so GAN cubes can be decrypted
app.commandLine.appendSwitch('enable-experimental-web-platform-features');
let btPick = null;
let busy = false, pendingReload = false, reloadNow = () => {}, blocker = null;
const send = (ch, data) => { if (win && !win.isDestroyed()) win.webContents.send(ch, data); };

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 900, minWidth: 420, minHeight: 600,
    backgroundColor: '#0B0C0F', title: 'The Cube Timer', icon: path.join(__dirname, '..', 'app', 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, '..', 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, '..', 'app', 'index.html'));
  // live reload: refresh only when index.html really changed, and never in the middle of a timed solve
  const indexPath = path.join(__dirname, '..', 'app', 'index.html');
  const hashOf = () => { try { return crypto.createHash('sha1').update(fs.readFileSync(indexPath)).digest('hex'); } catch (e) { return null; } };
  let lastHash = hashOf(), t = null;
  const maybeReload = () => {
    const h = hashOf();
    if (!h || h === lastHash) return;
    if (busy) { pendingReload = true; return; }
    lastHash = h; pendingReload = false;
    if (win && !win.isDestroyed()) win.webContents.reloadIgnoringCache();
  };
  reloadNow = maybeReload;
  try {
    fs.watch(path.join(__dirname, '..', 'app'), { recursive: true }, () => { clearTimeout(t); t = setTimeout(maybeReload, 800); });
  } catch (e) {}
  // Bluetooth device chooser: Electron has no built-in picker, so the page shows its own list
  win.webContents.on('select-bluetooth-device', (event, devices, callback) => {
    event.preventDefault();
    btPick = callback;
    send('bt:devices', devices.map(d => ({ id: d.deviceId, name: d.deviceName || 'Unknown device' })));
  });
  try {
    win.webContents.session.setBluetoothPairingHandler((details, cb) => cb({ confirmed: true }));
  } catch (e) {}
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
// ---- shared-folder sync: one JSON file the phone and PC both read and write ----
let syncWatcher = null;
ipcMain.handle('sync:pick', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Choose a folder to sync through (OneDrive, Google Drive, Dropbox…)', properties: ['openDirectory', 'createDirectory'] });
  return r.canceled || !r.filePaths[0] ? null : r.filePaths[0];
});
ipcMain.handle('sync:read', async (_e, dir) => {
  try { return await fs.promises.readFile(path.join(dir, 'LastLayerLab-sync.json'), 'utf8'); } catch (e) { return null; }
});
ipcMain.handle('sync:write', async (_e, { dir, text }) => {
  try { const f = path.join(dir, 'LastLayerLab-sync.json'); await fs.promises.writeFile(f + '.tmp', text, 'utf8'); await fs.promises.rename(f + '.tmp', f); return true; } catch (e) { return false; }
});
ipcMain.handle('sync:watch', (_e, dir) => {
  try { if (syncWatcher) syncWatcher.close(); } catch (e) {}
  syncWatcher = null; if (!dir) return true;
  let t = null;
  try { syncWatcher = fs.watch(dir, (ev, name) => { if (name && String(name).startsWith('LastLayerLab-sync.json') && !String(name).endsWith('.tmp')) { clearTimeout(t); t = setTimeout(() => send('sync:changed', true), 1500); } }); } catch (e) {}
  return true;
});
ipcMain.handle('bt:choose', (_e, id) => { if (btPick) { const cb = btPick; btPick = null; cb(id || ''); } return true; });
// while a solve is being timed: keep the PC and screen awake, and hold off live reloads
ipcMain.handle('timer:busy', (_e, on) => {
  busy = !!on;
  if (busy && blocker === null) blocker = powerSaveBlocker.start('prevent-display-sleep');
  if (!busy && blocker !== null) { try { powerSaveBlocker.stop(blocker); } catch (e) {} blocker = null; }
  if (!busy && pendingReload) setTimeout(() => reloadNow(), 1500);
  return true;
});
ipcMain.handle('file:save', async (_e, { name, text }) => {
  const r = await dialog.showSaveDialog(win, { defaultPath: path.join(app.getPath('documents'), String(name || 'export.json').replace(/[\\/:*?"<>|]/g, '_')) });
  if (r.canceled || !r.filePath) return { canceled: true };
  try { await fs.promises.writeFile(r.filePath, String(text), 'utf8'); return { ok: true, path: r.filePath }; } catch (err) { return { ok: false }; }
});
ipcMain.handle('update:check', () => { check(); return true; });
ipcMain.handle('update:install', () => { setImmediate(() => autoUpdater.quitAndInstall(false, true)); return true; });

// The app used to be called "Last Layer Lab". Keep using that data folder so every solve, session and setting carries over.
try { app.setPath('userData', path.join(app.getPath('appData'), 'Last Layer Lab')); } catch (e) {}
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
