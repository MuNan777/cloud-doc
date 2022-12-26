const fs = window.require('fs').promises

export const readFile = (path: string) => {
  return fs.readFile(path, { encoding: 'utf8' })
}
export const writeFile = (path: string, content: string | NodeJS.ArrayBufferView) => {
  return fs.writeFile(path, content, { encoding: 'utf8' })
}
export const renameFile = (path: string, newPath: string) => {
  return fs.rename(path, newPath)
}
export const removeFile = (path: string) => {
  return fs.unlink(path)
}
export const mkDir = (path: string) => {
  return fs.mkdir(path)
}
export const exists = async (path: string) => {
  try {
    await fs.access(path)
    return true
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return false
    }
  }
}