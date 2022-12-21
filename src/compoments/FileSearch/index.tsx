import React, { useState, useRef, useEffect, useCallback } from "react"
import useKeyPress from "../../hooks/useKeyPress"
import useIpcRenderer from "../../hooks/useIpcRenderer"
import './index.scss'
import { FileItem } from "../../types"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMarkdown } from "@fortawesome/free-brands-svg-icons"
import classNames from "classnames"
import { getParentNode } from "../../utils/common"


const FileSearch = (props: { files: FileItem[], onClick: (id: string) => void; }) => {
  const [inputActive, setInputActive] = useState(false)
  const [value, setValue] = useState('')
  const escPressed = useKeyPress('Escape')
  const [searchedFiles, setSearchedFiles] = useState<FileItem[]>([])
  const node = useRef<null | HTMLDivElement>(null)
  const inputNode = useRef<null | HTMLInputElement>(null)

  const showModal = () => {
    if (node.current) {
      node.current.classList.add('show')
      node.current.style.display = 'block'
    }
  }

  const hideModal = () => {
    if (node.current) {
      node.current.classList.remove('show')
      node.current.style.display = 'none'
    }
  }

  const startSearch = () => {
    showModal()
    setInputActive(true)
  }

  useIpcRenderer({
    'search-file': startSearch
  })

  const closeSearch = useCallback(() => {
    setValue('')
    hideModal()
  }, [])

  const onFileClick = (id: string) => {
    console.log(555)
    props.onClick(id)
    closeSearch()
  }

  useEffect(() => {
    if (inputActive) {
      setSearchedFiles(props.files.filter(file => (value !== '' && file.title.startsWith(value))))
    }
  }, [value, props.files, inputActive])

  useEffect(() => {
    if (escPressed && inputActive) {
      closeSearch()
    }
  }, [closeSearch, escPressed, inputActive, props, value])

  const handleClick = (e: MouseEvent) => {
    if (!getParentNode('modal-content', e.target)) {
      closeSearch()
    }
  }

  useEffect(() => {
    const input = inputNode.current
    if (inputActive && input != null) {
      input.focus()
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  })

  return (
    <div className="search-modal">
      <div ref={node} className="modal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="p-2">
              <div>
                <input ref={inputNode} placeholder="输入文件名称" className="search-input" onChange={(e) => { setValue(e.target.value) }}></input>
              </div>
              <div className={classNames({ 'search-list': true, 'mt-2': searchedFiles.length > 0 })}>
                <ul className="list-group list-group-flush file-list search-list-component">
                  {
                    searchedFiles.map(file => (
                      <li
                        key={file.id}
                        className="list-group-item bg-light d-flex align-items-center mx-0">
                        <span className="me-2">
                          <FontAwesomeIcon
                            size="lg"
                            icon={faMarkdown}
                          />
                        </span>
                        <span
                          className="c-link"
                          style={{ height: '1.5rem', lineHeight: '1.5rem', width: '100%' }}
                          onClick={() => { onFileClick(file.id) }}
                        >
                          {file.title}
                        </span>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileSearch