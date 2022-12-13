
import { Menu, MenuItemConstructorOptions, ipcRenderer } from 'electron'
import { useEffect, useRef } from 'react'

const useContextMenu = (itemArr: MenuItemConstructorOptions[], targetSelector: string, deps?: React.DependencyList | undefined) => {
  let clickedElement = useRef<null | EventTarget>(null)
  useEffect(() => {
    console.log(Menu)
    const menu = Menu.buildFromTemplate(itemArr)
    Menu.setApplicationMenu(menu)
    const handleContextMenu = async (e: MouseEvent) => {
      if (document.querySelector(targetSelector)?.contains(e.target as Node)) {
        clickedElement.current = e.target
        menu.popup()
      }
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return clickedElement
}

export default useContextMenu