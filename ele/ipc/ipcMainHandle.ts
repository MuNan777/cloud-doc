import { BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, app, dialog } from 'electron'
import { createManager } from '../common/CosManager'
import applicationMenuTemplate from './applicationMenuTemplate'
import Store from 'electron-store'
import { join } from 'path'
import pkg from '../../package.json'
import { FileItem } from '../../src/types'
import { CosObject } from 'cos-nodejs-sdk-v5'
const settingsStore = new Store({ name: 'Settings' })
const fileStore = new Store({ name: 'Files Data' })

let activeMenu: null | Electron.Menu = null

type windowMapType = { [key: string]: BrowserWindow }
const windowMap: windowMapType = {}

const SAVED_LOCATION = async (): Promise<string> => {
  const settingPath = settingsStore.get('savedFileLocation') as string
  return settingPath || join(app.getPath('documents'), pkg.name)
}

let savedLocation: null | string = null

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
    activeMenu = menu
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
  },
  updateFileToCos: () => {
    ipcMain.handle('upload-file', async (event, ...args) => {
      const [key, path] = args as string[]
      const manager = createManager()
      try {
        const res = await manager.uploadFile(key, path)
        console.log('上传成功', res)
        windowMap['main'].webContents.send('active-file-uploaded')
      } catch (err) {
        dialog.showErrorBox('同步失败', '请检查腾讯云参数是否正确')
      }
    })
  },
  configIsSaved: () => {
    ipcMain.on('config-is-saved', async () => {
      if (activeMenu) {
        let CosMenu = process.platform === 'darwin' ? activeMenu.items[3] : activeMenu.items[2]
        const switchItems = (toggle: boolean) => {
          [1, 2, 3].forEach(number => {
            if (CosMenu.submenu) {
              CosMenu.submenu.items[number].enabled = toggle
            }
          })
        }
        const CosConfig = ['secretId', 'secretKey', 'bucketName', 'regionName'].every(key => !!settingsStore.get(key))
        if (CosConfig) {
          switchItems(true)
        } else {
          switchItems(false)
        }
      }
    })
  },
  downloadFile: () => {
    ipcMain.on('download-file', async (event, ...args) => {
      const [key, path, id] = args
      const manager = createManager()
      const filesObj = fileStore.get('fileMap') as { [key: string]: FileItem }
      try {
        const result = await manager.headObject(key)
        if (result && result.headers) {
          const serverUpdatedTime = new Date(result.headers.date).getTime()
          const localUpdatedTime = filesObj[id].updatedAt
          if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
            manager.downloadFile(key, path).then(() => {
              windowMap['main'].webContents.send('file-downloaded', 'download-success', id)
            })
          } else {
            windowMap['main'].webContents.send('file-downloaded', 'no-new-file', id)
          }
        } else {
          windowMap['main'].webContents.send('file-downloaded', 'no-file', id)
        }
      } catch (err) {
        console.error(err)
        dialog.showErrorBox('同步失败', '请检查腾讯云参数是否正确')
      }
    })
  },
  DownloadAllFromCos: () => {
    ipcMain.on('download-all-from-cos', async () => {
      if (!savedLocation) {
        savedLocation = await SAVED_LOCATION()
      }
      windowMap['main'].webContents.send('loading-status', { status: true })
      const manager = createManager()
      const filesObj = fileStore.get('fileMap') as { [key: string]: FileItem }
      const keys = Object.keys(filesObj)
      const titleMap: { [key: string]: FileItem } = {}
      keys.forEach(key => {
        titleMap[filesObj[key].title] = filesObj[key]
      })
      const titles = Object.keys(titleMap)
      const list = await manager.getBucket()
      const notLocalList: CosObject[] = []
      const hasLocalList: CosObject[] = []
      list.forEach(item => {
        const title = item.Key.slice(0, -3)
        if (titles.includes(title)) {
          hasLocalList.push(item)
        } else {
          notLocalList.push(item)
        }
      })
      const pNotLocalList = notLocalList.map(async item => {
        return new Promise(async (resolve, reject) => {
          if (savedLocation) {
            try {
              const key = item.Key
              const path = join(savedLocation, item.Key)
              await manager.downloadFile(key, path)
              resolve({
                title: key.slice(0, -3),
                path,
                hasLocal: false
              })
            } catch (err) {
              reject(err)
            }
          } else {
            reject('获取本地路径失败')
          }
        })
      })
      const pHasLocalList = hasLocalList.map(async item => {
        return new Promise(async (resolve, reject) => {
          if (savedLocation) {
            try {
              const serverUpdatedTime = new Date(item.LastModified).getTime()
              const title = item.Key.slice(0, -3)
              const path = join(savedLocation, item.Key)
              const fileItem = titleMap[title]
              const localUpdatedTime = fileItem.updatedAt
              if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                await manager.downloadFile(item.Key, path)
                resolve({
                  id: fileItem.id,
                  title,
                  path,
                  hasLocal: true
                })
              }
              resolve({})
            } catch (err) {
              reject(err)
            }
          } else {
            reject('获取本地路径失败')
          }
        })
      })
      Promise.all([...pNotLocalList, ...pHasLocalList]).then((data) => {
        windowMap['main'].webContents.send('file-downloaded-all', data)
      }).catch((err) => {
        console.log(err)
        dialog.showErrorBox('文件来取', '请检查腾讯云参数是否正确')
      }).finally(() => {
        windowMap['main'].webContents.send('loading-status', { status: false })
      })
    })
  },
  UploadAllToCos: () => {
    ipcMain.on('upload-all-to-cos', async () => {
      windowMap['main'].webContents.send('loading-status', { status: true })
      const manager = createManager()
      const filesObj = fileStore.get('fileMap') as { [key: string]: FileItem }
      const uploadPromiseArr = Object.keys(filesObj).map(key => {
        const file = filesObj[key]
        return manager.uploadFile(`${file.title}.md`, file.path)
      })
      Promise.all(uploadPromiseArr).then(result => {
        console.log(result)
        // show uploaded message
        dialog.showMessageBox({
          type: 'info',
          title: `成功上传了${result.length}个文件`,
          message: `成功上传了${result.length}个文件`,
        })
        windowMap['main'].webContents.send('files-uploaded')
      }).catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
      }).finally(() => {
        windowMap['main'].webContents.send('loading-status', { status: false })
      })
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
