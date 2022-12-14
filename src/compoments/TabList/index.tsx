import { FileItem } from "../../types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classNames'
import './TabList.scss'

export interface TabListProps {
  files: FileItem[],
  activeFile: FileItem,
  unSaveFiles: FileItem[],
  onTabClick: (file: FileItem) => void,
  onCloseTab: (file: FileItem) => void
}

const TabList = (props: TabListProps) => {
  const { files, activeFile, unSaveFiles, onTabClick, onCloseTab } = props
  return (
    <>
      <ul className="nav nav-tabs tablist-component">
        {files.map(file => {
          const withUnsavedMark = unSaveFiles.includes(file)
          const fClassName = classNames({
            'nav-link': true,
            'active': file.id === activeFile.id,
            'withUnsaved': withUnsavedMark
          })
          return (
            <li className="nav-item" key={file.id}>
              <a
                href="#"
                className={fClassName}
                onClick={(e) => { e.preventDefault(); onTabClick(file) }}
              >
                {file.title}
                <span
                  className="ms-2 close-icon"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(file) }}
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                  />
                </span>
                {withUnsavedMark && <span className="rounded-circle ms-2 unsaved-icon"></span>}
              </a>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default TabList