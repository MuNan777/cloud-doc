import { ipcRenderer } from 'electron'
import Store from 'electron-store'
import { join } from 'path'
import pkg from '../../package.json'
import './index.css'

const settingsStore = new Store({ name: 'Settings' })

const configArrDomId = ['#savedFileLocation', '#secretId', '#secretKey', '#bucketName', '#regionName']

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', async () => {
  const defaultPath = join(await ipcRenderer.invoke('get-path', 'documents'), pkg.name)

  configArrDomId.forEach(selector => {
    const savedValue = settingsStore.get(selector.substring(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
    if (!savedValue && selector === '#savedFileLocation') {
      $(selector).value = defaultPath
    }
  })

  $('#select-new-location').addEventListener('click', async () => {
    const data = await ipcRenderer.invoke('show-open-dialog', {
      properties: ['openDirectory'],
      message: '选择文件的存储路径',
    }, 'settings')
    const path = data.filePaths
    if (Array.isArray(path)) {
      $('#savedFileLocation').value = path[0]
    }
  })
  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault()
    configArrDomId.forEach(selector => {
      if ($(selector)) {
        let { id, value } = $(selector)
        settingsStore.set(id, value ? value : '')
      }
    })
    ipcRenderer.send('config-is-saved')
    ipcRenderer.send('close-window', 'settings')
  })
  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault()
    $('.nav-link').forEach(element => {
      element.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach(element => {
      element.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })
})