import { ipcRenderer } from "electron"
import { getPath } from "../ipc/ipcRenderer"
import pkg from '../../package.json'

const { join } = window.require('path')

export const SAVED_LOCATION = async () => {
  return join(await getPath(ipcRenderer, 'documents'), pkg.name)
}