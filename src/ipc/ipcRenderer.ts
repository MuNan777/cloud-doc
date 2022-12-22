import { MenuItemConstructorOptions } from "electron";
import { getPathType } from "../types";

let id = 0


export const contextmenu = (ipcRenderer: Electron.IpcRenderer, menuItems: MenuItemConstructorOptions[]) => {
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

export const contextmenuPopup = (ipcRenderer: Electron.IpcRenderer) => {
  ipcRenderer.invoke('contextmenu-popup')
}

export const getPath = async (ipcRenderer: Electron.IpcRenderer, path: getPathType) => {
  return await ipcRenderer.invoke('get-path', path)
}

export const showOpenDialog = async (ipcRenderer: Electron.IpcRenderer, options: Electron.OpenDialogOptions) => {
  return await ipcRenderer.invoke('show-open-dialog', options)
}

export const showMessageBox = async (ipcRenderer: Electron.IpcRenderer, options: Electron.MessageBoxOptions) => {
  return await ipcRenderer.invoke('show-message-box', options)
}