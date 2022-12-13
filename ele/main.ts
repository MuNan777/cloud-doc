import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import path from 'path'

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

  ipcMain.handle('CurrentWindow', async () => {
    return main
  })

  main.loadURL(urlLocation)
}

app.whenReady().then(() => {
  createWindow()
})