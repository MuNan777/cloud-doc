import React, { useState, useRef, useEffect } from "react"
import useKeyPress from "../../hooks/useKeyPress"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faClose } from '@fortawesome/free-solid-svg-icons'

const FileSearch = (props: { title: string; onSearch: (keyword: string | boolean) => void; }) => {
  const [inputActive, setInputActive] = useState(false)
  const [value, setValue] = useState('')
  const enterPressed = useKeyPress('Enter')
  const escPressed = useKeyPress('Escape')
  let node = useRef<null | HTMLInputElement>(null)

  const startSearch = () => {
    setInputActive(true)
  }

  const closeSearch = () => {
    setValue('')
    setInputActive(false)
    props.onSearch(false)
  }

  useEffect(() => {
    if (enterPressed && inputActive) {
      props.onSearch(value)
    }
    if (escPressed && inputActive) {
      closeSearch()
    }
  })

  useEffect(() => {
    if (inputActive && node.current != null) {
      node.current.focus()
    }
  }, [inputActive])

  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center mb-0">
      {
        !inputActive &&
        <>
          <span>{props.title}</span>
          <button
            type="button"
            className="btn btn-link"
            onClick={startSearch}
          >
            <FontAwesomeIcon
              title="搜索"
              size="lg"
              icon={faSearch}
            />
          </button>
        </>
      }
      {inputActive &&
        <>
          <input
            className="form-control"
            value={value}
            ref={node}
            onChange={(e) => { setValue(e.target.value) }}
          />
          <button
            type="button"
            className="btn btn-link"
            onClick={closeSearch}
          >
            <FontAwesomeIcon
              title="关闭"
              size="lg"
              icon={faClose}
            />
          </button>
        </>
      }
    </div>
  )
}

export default FileSearch