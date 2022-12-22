import { BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, app, dialog } from 'electron'
import { applicationMenuTemplate } from './applicationMenuTemplate'
const ipcMainHandle: { [key: string]: (win: BrowserWindow) => unknown } = {
  contextmenu: (win: BrowserWindow) => {
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
  getPath: (win: BrowserWindow) => {
    ipcMain.handle('get-path', async (event, ...args) => {
      return app.getPath(args[0])
    })
  },
  registerApplicationMenu: (win: BrowserWindow) => {
    const menu = Menu.buildFromTemplate(applicationMenuTemplate)
    Menu.setApplicationMenu(menu)
  },
  showOpenDialog: (win: BrowserWindow) => {
    ipcMain.handle('show-open-dialog', async (event, ...args) => {
      const options = args[0] as Electron.OpenDialogOptions
      return dialog.showOpenDialog(win, options)
    })
  },
  showMessageBox: (win: BrowserWindow) => {
    ipcMain.handle('show-message-box', async (event, ...args) => {
      const options = args[0] as Electron.MessageBoxOptions
      return dialog.showMessageBox(win, options)
    })
  }
}

export const loadIpcMainHandle = (win: BrowserWindow) => {
  for (let key of Object.keys(ipcMainHandle)) {
    ipcMainHandle[key](win)
  }
}
