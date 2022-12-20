import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'
import { loadIpcMainHandle } from './ipc/ipcMainHandle'
import Store from 'electron-store'

const urlLocation = isDev ? 'http://localhost:3000' : 'dummyUrl'

const createWindow = () => {
  const main = new BrowserWindow({
    width: 1024,
    height: 690,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  Store.initRenderer()

  loadIpcMainHandle(main)

  main.loadURL(urlLocation)
}

app.whenReady().then(() => {
  createWindow()
})

