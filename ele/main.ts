import { app, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'
import { loadIpcMainHandle, setWindowMap } from './ipc/ipcMainHandle'
import Store from 'electron-store'
import { AppWindow, initAutoUpdater } from './common'
import electronReload from 'electron-reloader'

const urlLocation = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, './build/index.html')}`

const createWindow = () => {
  let mainWindow: AppWindow | null = new AppWindow({
    width: 1024,
    height: 690,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  }, urlLocation)

  initAutoUpdater(mainWindow)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  setWindowMap('main', mainWindow)

  Store.initRenderer()

  loadIpcMainHandle()

  ipcMain.on('open-settings-window', () => {
    if (mainWindow) {
      const settingsWindowConfig = {
        width: 650,
        height: 480,
        parent: mainWindow,
        webPreferences: {
          preload: path.join(__dirname, '../cloud-doc/preload.js'),
          nodeIntegration: false,
          contextIsolation: true,
        }
      }
      const settingsFileLocation = `file://${path.join(__dirname, './children-pages-build/settings.html')}`
      let settingsWindow: AppWindow | null = new AppWindow(settingsWindowConfig, settingsFileLocation)
      settingsWindow.removeMenu()
      settingsWindow.on('closed', () => {
        settingsWindow = null
      })
      setWindowMap('settings', settingsWindow)
      // settingsWindow.webContents.toggleDevTools() 
    }
  })
}

// 热加载
try {
  electronReload(module, {});
} catch (_) { }

app.whenReady().then(() => {
  createWindow()
})

