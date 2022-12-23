
import { MenuItemConstructorOptions } from 'electron'
import { useEffect, useRef } from 'react'
import { contextmenu, contextmenuPopup } from '../ipc/ipcRenderer'

const useContextMenu = (itemArr: MenuItemConstructorOptions[], targetSelector: string, deps?: React.DependencyList | undefined) => {
  let clickedElement = useRef<null | EventTarget>(null)
  useEffect(() => {
    contextmenu(itemArr)
    const handleContextMenu = async (e: MouseEvent) => {
      const elements = document.querySelectorAll(targetSelector)
      elements.forEach(el => {
        if (el && el.contains(e.target as Node)) {
          clickedElement.current = e.target
          contextmenuPopup()
        }
      })
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