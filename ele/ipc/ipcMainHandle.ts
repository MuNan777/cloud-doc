import { BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, app, dialog } from 'electron'
import applicationMenuTemplate from './applicationMenuTemplate'

type windowMapType = { [key: string]: BrowserWindow }
const windowMap: windowMapType = {}

const ipcMainHandle: { [key: string]: () => unknown } = {
  contextmenu: () => {
    let menu: Electron.Menu | null = null
    ipcMain.on('contextmenu', async (event, args) => {
      const template = args.map((item: { label: string, clickId: number }) => {
        return {
          label: item.label,
          click: () => {
            event.reply('contextmenu-click', item.clickId)
          }
        }
      }) as MenuItemConstructorOptions[]
      menu = Menu.buildFromTemplate(template)
    })

    ipcMain.handle('contextmenu-popup', async () => {
      if (menu != null) {
        menu.popup()
      }
    })
  },
  getPath: () => {
    ipcMain.handle('get-path', async (event, ...args) => {
      return app.getPath(args[0])
    })
  },
  registerApplicationMenu: () => {
    const menu = Menu.buildFromTemplate(applicationMenuTemplate)
    Menu.setApplicationMenu(menu)
  },
  showOpenDialog: () => {
    ipcMain.handle('show-open-dialog', async (event, ...args) => {
      const options = args[0] as Electron.OpenDialogOptions
      const windowName = args[1] as string
      const win = (windowName && windowMap[windowName]) || windowMap['main']
      return dialog.showOpenDialog(win, options)
    })
  },
  showMessageBox: () => {
    ipcMain.handle('show-message-box', async (event, ...args) => {
      const options = args[0] as Electron.MessageBoxOptions
      const windowName = args[1] as string
      const win = (windowName && windowMap[windowName]) || windowMap['main']
      return dialog.showMessageBox(win, options)
    })
  },
  closeWindow: () => {
    ipcMain.on('close-window', async (event, ...args) => {
      const windowName = args[0] as string
      const win = windowName && windowMap[windowName]
      if (win) {
        win.close()
      }
    })
  }
}

export const setWindowMap = (name: string, win: BrowserWindow) => {
  windowMap[name] = win
}

export const loadIpcMainHandle = () => {
  for (let key of Object.keys(ipcMainHandle)) {
    ipcMainHandle[key]()
  }
}
