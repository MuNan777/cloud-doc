export const readFile = (path: string) => {
  return window.electronAPI.readFile(path)
}
export const writeFile = (path: string, content: string | NodeJS.ArrayBufferView) => {
  return window.electronAPI.writeFile(path, content)
}
export const renameFile = (path: string, newPath: string) => {
  return window.electronAPI.renameFile(path, newPath)
}
export const removeFile = (path: string) => {
  return window.electronAPI.removeFile(path)
}
export const mkDir = (path: string) => {
  return window.electronAPI.mkDir(path)
}
export const exists = async (path: string) => {
  return window.electronAPI.exists(path)
}