import { useState } from "react"
import { FileItem } from "../types"
import { getParentNode } from "../utils/common"
import useContextMenu from "./useContextMenu"
import FileList from '../components/FileList'
import { shell } from "electron"


export interface EditStateProps { status: boolean | string, title: string }

export interface FileListArgs {
  files: FileItem[],
  onFileClick: (id: string) => void,
  onSaveEdit: (id: string, value: string, isNew: boolean) => void,
  onFileDelete: (id: string) => void
  markAndFiles: { mark: string, files: FileItem[] }[]
}
const useFileListsWithContext = (props: FileListArgs) => {

  const { files, onFileClick, onSaveEdit, onFileDelete, markAndFiles } = props

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