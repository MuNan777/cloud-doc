import { ipcRenderer, MenuItemConstructorOptions } from "electron";
import { getPathType } from "../types";

let id = 0


export const contextmenu = (menuItems: MenuItemConstructorOptions[]) => {
  const menuClickMap = new Map<Number, Function>()
  const items = []
  for (let menuItem of menuItems) {
    if (menuItem.click) {
      menuClickMap.set(id, menuItem.click)
    }
    items.push({ label: menuItem.label, clickId: id })
    id++;
  }
  ipcRenderer.send('contextmenu', items)
  ipcRenderer.on('contextmenu-click', (event, args) => {
    const id = args as number
    const fn = menuClickMap.get(id)
    if (fn) {
      fn()
    }
  })
}

export const contextmenuPopup = () => {
  ipcRenderer.invoke('contextmenu-popup')
}

export const getPath = async (path: getPathType) => {
  return await ipcRenderer.invoke('get-path', path)
}

export const showOpenDialog = async (options: Electron.OpenDialogOptions) => {
  return await ipcRenderer.invoke('show-open-dialog', options)
}

export const showMessageBox = async (options: Electron.MessageBoxOptions, windowName?: string) => {
  return await ipcRenderer.invoke('show-message-box', options, windowName)
}

export const uploadFile = async (key: string, path: string) => {
  return await ipcRenderer.invoke('upload-file', key, path)
}
export const downloadFile = (title: string, path: string, id: string) => {
  ipcRenderer.send('download-file', `${title}.md`, path, id)
}
