import { MenuItemConstructorOptions } from "electron";

let id = 0;

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