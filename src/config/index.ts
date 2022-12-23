import { getPath } from "../ipc/ipcRenderer"
import pkg from '../../package.json'
import Store from 'electron-store'

const { join } = window.require('path')
const settingsStore = new Store({ name: 'Settings' })

export const SAVED_LOCATION = async () => {
  const settingPath = settingsStore.get('savedFileLocation')
  return settingPath || join(await getPath('documents'), pkg.name)
}
export const RECENTLY_USED_FILES_MAX_LENGTH = 10