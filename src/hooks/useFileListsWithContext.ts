import { useState } from "react"
import { FileItem } from "../types"
import { getParentNode } from "../utils/common"
import useContextMenu from "./useContextMenu"
import FileList from '../components/FileList'
import { shell } from "electron"
import { downloadFile, showMessageBox, uploadFile } from "../ipc/ipcRenderer"
import Store from 'electron-store'

const settingsStore = new Store({ name: 'Settings' })

export interface EditStateProps { status: boolean | string, title: string }



export interface FileListArgs {
  files: FileItem[],
  onFileClick: (id: string) => void,
  onSaveEdit: (id: string, value: string, isNew: boolean) => void,
  onFileDelete: (id: string) => void
  onLoadLocalFileContent: (path: string, id: string) => Promise<void>
  markAndFiles: { mark: string, files: FileItem[] }[]
}
const useFileListsWithContext = (props: FileListArgs) => {

  const { files, onFileClick, onSaveEdit, onFileDelete, onLoadLocalFileContent, markAndFiles } = props

  const map: { [key: string]: EditStateProps } = {}

  markAndFiles.forEach(item => {
    map[item.mark] = { status: false, title: '' }
  })

  const [editStateMap, setEditStateMap] = useState<{ [key: string]: EditStateProps }>(map)

  const clickedItem = useContextMenu([
    {
      label: '打开文件',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const id = e.dataset.id
          if (id) {
            onFileClick(id)
          }
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const { id, title, mark } = e.dataset
          if (mark) {
            setEditStateMap({ ...editStateMap, [mark]: { status: id || false, title: title || '' } })
          }
        }
      }
    },
    {
      label: '打开文件所在位置',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const { path } = e.dataset
          if (path) {
            shell.showItemInFolder(path)
          }
        }
      }
    },
    {
      label: '上传当前文件',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const { title, path } = e.dataset
          const CosIsConfig = [
            'secretId',
            'secretKey',
            'bucketName',
            'regionName'
          ].every(key => !!settingsStore.get(key))
          if (CosIsConfig) {
            if (title && path) {
              uploadFile(`${title}.md`, path)
            }
          } else {
            showMessageBox({
              type: 'error',
              title: '云同步错误',
              message: '检测到没有云同步配置，请前往云同步菜单设置'
            })
          }
        }
      }
    },
    {
      label: '拉取当前文件',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const { title, path, id } = e.dataset
          const CosIsConfig = [
            'secretId',
            'secretKey',
            'bucketName',
            'regionName'
          ].every(key => !!settingsStore.get(key))
          if (CosIsConfig) {
            if (title && path && id) {
              downloadFile(title, path, id)
            }
          } else {
            showMessageBox({
              type: 'error',
              title: '云同步错误',
              message: '检测到没有云同步配置，请前往云同步菜单设置'
            })
          }
        }
      }
    },
    {
      label: '载入本地文件内容',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const { path, id } = e.dataset
          if (path && id) {
            onLoadLocalFileContent(path, id).then(() => {
              showMessageBox({
                type: 'info',
                title: `载入成功`,
                message: '本地文件载入成功'
              })
            })
          }
        }
      }
    },
    {
      label: '删除文件',
      click: () => {
        const parentElement = getParentNode('file-item', clickedItem.current)
        if (parentElement) {
          const e = parentElement as HTMLElement
          const { id } = e.dataset
          if (id) {
            onFileDelete(id)
          }
        }
      }
    },
  ], `.file-list`, [files])

  return markAndFiles.map(item => {
    return FileList({
      files: item.files,
      onFileClick,
      onFileDelete,
      onSaveEdit,
      editStatus: editStateMap![item.mark],
      mark: item.mark
    })
  })
}

export default useFileListsWithContext