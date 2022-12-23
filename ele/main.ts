import { app, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'
import { loadIpcMainHandle, setWindowMap } from './ipc/ipcMainHandle'
import Store from 'electron-store'
import { AppWindow } from './common'

const urlLocation = isDev ? 'http://localhost:3000' : 'dummyUrl'

const createWindow = () => {
  let mainWindow: AppWindow | null = new AppWindow({
    width: 1024,
    height: 690,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  }, urlLocation)
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
          nodeIntegration: true,
          contextIsolation: false,
        }
      }
      const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
      let settingsWindow: AppWindow | null = new AppWindow(settingsWindowConfig, settingsFileLocation)
      settingsWindow.removeMenu()
      settingsWindow.on('closed', () => {
        settingsWindow = null
      })
      setWindowMap('settings', settingsWindow)
    }
  })
}

app.whenReady().then(() => {
  createWindow()
})

