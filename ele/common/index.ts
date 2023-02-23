import { BrowserWindow } from 'electron'

export * from './CosManager'
export * from './autoUpdaterConf'
export * from './appTray'

export class AppWindow extends BrowserWindow {
  constructor(config: Electron.BrowserWindowConstructorOptions, urlLocation: string) {
    const baseConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
      show: false,
      backgroundColor: '#efefef',
    }
    super({ ...baseConfig, ...config })
    this.loadURL(urlLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

