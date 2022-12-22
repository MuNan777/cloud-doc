import { FileItem } from "../../types"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import './index.scss'

export interface TabListProps {
  files: FileItem[],
  activeFile: FileItem,
  unSaveIds: string[],
  onTabClick: (id: string) => void,
  onCloseTab: (id: string) => void
}

const TabList = (props: TabListProps) => {
  const { files, activeFile, unSaveIds, onTabClick, onCloseTab } = props
  return (
    <>
      <ul className="nav nav-tabs tab-list-component">
        {files.map(file => {
          const withUnsavedMark = unSaveIds.includes(file.id)
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
                onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
              >
                {file.title}
                <span
                  className="ms-2 close-icon"
                  onClick={(e) => { e.stopPropagation(); onCloseTab(file.id) }}
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