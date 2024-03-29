import { useCallback, useEffect, useRef, useState } from 'react'
import useKeyPress from '../../hooks/useKeyPress'
import { FileItem } from '../../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import classNames from 'classnames'
import './index.scss'

export interface FileListArgs {
  files: FileItem[],
  onFileClick: (id: string) => void,
  onSaveEdit: (id: string, value: string, isNew: boolean) => void,
  onFileDelete: (id: string) => void
  editStatus: { status: boolean | string, title: string }
  mark: string
}

const FileList = (props: FileListArgs) => {
  const [editStatus, setEditStatus] = useState<boolean | string>(false)
  const [value, setValue] = useState('')
  const [inputMessage, setInputMessage] = useState('')
  const enterPressed = useKeyPress('Enter')
  const escPressed = useKeyPress('Escape')
  const node = useRef<null | HTMLInputElement>(null)

  const { files, onFileClick, onSaveEdit, onFileDelete } = props

  useEffect(() => {
    const { status, title } = props.editStatus
    if (status) {
      setEditStatus(status)
      setValue(title)
    }
  }, [props.editStatus])

  const closeInput = useCallback((editItem: FileItem) => {
    setEditStatus(false)
    setValue('')
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }, [onFileDelete])

  const canCreate = useCallback(() => {
    let editItem: null | FileItem = null
    let existsFile: boolean = false
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.id === editStatus) {
        editItem = file
      } else {
        if (file.title === value && file.title !== '') {
          existsFile = true
        }
      }
    }
    return { editItem, existsFile }
  }, [editStatus, files, value])

  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
    }
  }, [files])

  useEffect(() => {
    let isEnter = false
    const { editItem, existsFile } = canCreate()
    if (editItem != null) {
      if (existsFile) {
        setInputMessage('文件名已存在！！')
      } else {
        setInputMessage('')
      }
      if (enterPressed && editStatus && value.trim() !== '' && !existsFile) {
        isEnter = true
        onSaveEdit(editItem.id, value, editItem.isNew)
        closeInput(editItem)
      }
      if (escPressed && editStatus) {
        closeInput(editItem)
      }
    }
    const handleInputBlur = () => {
      if (value === '') {
        if (typeof editStatus === 'string') {
          closeInput(new FileItem({
            id: editStatus,
            isNew: true,
            createdAt: 0,
            isLoaded: false,
          }))
        }
      } else {
        if (editStatus && !isEnter) {
          const { editItem, existsFile } = canCreate()
          if (editItem && !existsFile) {
            onSaveEdit(editItem.id, value, editItem.isNew)
            closeInput(editItem)
          }
        }
      }
    }
    if (editStatus && node.current) {
      const n = node.current
      n.focus()
      n.addEventListener('blur', handleInputBlur)
      return () => {
        n.removeEventListener('blur', handleInputBlur)
      }
    }
  }, [canCreate, closeInput, editStatus, enterPressed, escPressed, onSaveEdit, value])

  return (
    <ul className='list-group list-group-flush file-list file-list-component'>
      {
        files.map(file => (
          <li
            className='list-group-item bg-light d-flex align-items-center file-item mx-0'
            key={file.id}
            data-id={file.id}
            data-title={file.title}
            data-path={file.path}
            data-mark={props.mark}
          >
            {
              (file.id !== editStatus && !file.isNew) &&
              <>
                <span className='me-2'>
                  <FontAwesomeIcon
                    size='lg'
                    icon={faMarkdown}
                  />
                </span>
                <span
                  className='c-link'
                  title={file.title}
                  style={{ height: '1.5rem', lineHeight: '1.5rem', width: '100%' }}
                  onClick={() => { onFileClick(file.id) }}
                >
                  {file.title}
                </span>
              </>
            }
            {
              ((file.id === editStatus) || file.isNew) &&
              <>
                <div style={{ position: 'relative' }} >
                  <input
                    className={classNames({ 'form-control': true, 'error': inputMessage !== '' })}
                    ref={node}
                    value={value}
                    placeholder='请输入文件名称'
                    onChange={(e) => { setValue(e.target.value) }}
                  />
                  {
                    inputMessage !== '' &&
                    <>
                      <div className='input-message'>{inputMessage}</div>
                    </>
                  }
                </div>

                <button
                  type='button'
                  className='icon-button bg-light border-0 ms-1'
                  onClick={() => { closeInput(file) }}
                >
                  <FontAwesomeIcon
                    title='关闭'
                    size='lg'
                    className='btn btn-link'
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