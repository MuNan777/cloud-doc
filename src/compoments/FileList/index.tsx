import { useCallback, useEffect, useRef, useState } from "react"
import useContextMenu from "../../hooks/useContextMenu"
import useKeyPress from "../../hooks/useKeyPress"
import { FileItem } from "../../types"
import { getParentNode } from "../../utils/common"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'

export interface FileListArgs {
  files: FileItem[],
  onFileClick: (id: string) => void,
  onSaveEdit: (id: string, value: string, isNew: boolean) => void,
  onFileDelete: (id: string) => void
}

const FileList = (props: FileListArgs) => {
  const [editStatus, setEditStatus] = useState<boolean | string>(false)
  const [value, setValue] = useState('')
  let node = useRef<null | HTMLInputElement>(null)
  const enterPressed = useKeyPress('Enter')
  const escPressed = useKeyPress('Escape')

  const { files, onFileClick, onSaveEdit, onFileDelete } = props

  const closeInput = useCallback((editItem: FileItem) => {
    setEditStatus(false)
    setValue('')
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }, [onFileDelete])

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
          const { id, title } = e.dataset
          setEditStatus(id || false)
          setValue(title || '')
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
  ], '.file-list', [files])

  useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if (editItem) {
      if (enterPressed && editStatus && value.trim() !== '') {
        onSaveEdit(editItem.id, value, editItem.isNew)
        setEditStatus(false)
        setValue('')
      }
      if (escPressed && editStatus) {
        closeInput(editItem)
      }
    }
  }, [closeInput, editStatus, enterPressed, escPressed, files, onSaveEdit, value])
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])
  useEffect(() => {
    if (editStatus && node.current) {
      node.current.focus()
    }
  }, [editStatus])

  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="list-group-item bg-light d-flex align-items-center file-item mx-0"
            key={file.id}
            data-id={file.id}
            data-title={file.title}
          >
            {
              (file.id !== editStatus && !file.isNew) &&
              <>
                <span className="me-2">
                  <FontAwesomeIcon
                    size="lg"
                    icon={faMarkdown}
                  />
                </span>
                <span
                  className="c-link"
                  style={{ height: '2.4rem', lineHeight: '2.4rem' }}
                  onClick={() => { onFileClick(file.id) }}
                >
                  {file.title}
                </span>
              </>
            }
            {
              ((file.id === editStatus) || file.isNew) &&
              <>
                <input
                  className="form-control"
                  ref={node}
                  value={value}
                  placeholder="请输入文件名称"
                  onChange={(e) => { setValue(e.target.value) }}
                />
                <button
                  type="button"
                  className="icon-button bg-light border-0 ms-1"
                  onClick={() => { closeInput(file) }}
                >
                  <FontAwesomeIcon
                    title="关闭"
                    size="lg"
                    className="btn btn-link"
                    icon={faTimes}
                  />
                </button>
              </>
            }
          </li>
        ))
      }
    </ul>
  )
}

export default FileList