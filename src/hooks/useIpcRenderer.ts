import { ipcRenderer } from "electron"
import { useEffect } from "react"

type keyCode = 'create-new-file' | 'save-edit-file' | 'search-file' | 'import-file'
type callBackType = (event: Electron.IpcRendererEvent, ...args: any[]) => void

const useIpcRenderer = (keyCallbackMap: Partial<{
  [key in keyCode]: callBackType
}>) => {
  useEffect(() => {
    Object.keys(keyCallbackMap).forEach(key => {
      const k = key as keyCode
      const callback = keyCallbackMap[k]
      if (callback) {
        ipcRenderer.on(key, callback)
      }
    })
    return () => {
      Object.keys(keyCallbackMap).forEach(key => {
        const k = key as keyCode
        const callback = keyCallbackMap[k]
        if (callback) {
          ipcRenderer.removeListener(key, callback)
        }
      })
    }
  })
}

export default useIpcRenderer