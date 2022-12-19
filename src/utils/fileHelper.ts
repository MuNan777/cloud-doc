const fs = window.require('fs').promises

export const readFile = (path: string) => {
  return fs.readFile(path)
}

export const writeFile = (path: string, content: string | NodeJS.ArrayBufferView) => {
  return fs.writeFile(path, content, { encoding: 'utf8' })
}
export const renameFile = (path: string, newPath: string) => {
  return fs.rename(path, newPath)
}
export const deleteFile = (path: string) => {
  return fs.unlink(path)
}