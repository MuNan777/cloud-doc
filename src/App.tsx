import React, { useCallback, useState } from 'react'
import FileSearch from './compoments/FileSearch'
import FileList from './compoments/FileList'
import BottomBtn from './compoments/BottomBtn'
import { faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons'
import TabList from './compoments/TabList'
import { FileItem } from './types'
import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"
import { getPreviewRender, objToArr } from './utils/common'
import { v4 as uuidV4 } from 'uuid'
import { exists, mkDir, readFile, removeFile, renameFile, writeFile } from './utils/fileHelper'
import Store from 'electron-store'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { RECENTLY_USED_FILES_MAX_LENGTH, SAVED_LOCATION } from './config'
import useIpcRenderer from './hooks/useIpcRenderer'

const { join, dirname } = window.require('path')

export interface FileMapProps { [key: string]: FileItem }

const fileStore = new Store<Record<string, FileMapProps>>({ 'name': 'Files Data' })

const saveFilesToStore = (fileMap: FileMapProps) => {
  const fileStoreObj = objToArr(fileMap).reduce<{ [key: string]: FileItem }>((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id, path, title, createdAt, body: '', isNew: false, isLoaded: false
    }
    return result
  }, {})
  fileStore.set('fileMap', fileStoreObj)
}

(async () => {
  const savedLocation = await SAVED_LOCATION()
  if (!await exists(savedLocation)) {
    mkDir(savedLocation)
  }
})()

function App () {
  const [fileMap, setFileMap] = useState<FileMapProps>(fileStore.get('fileMap') || {})
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState<string[]>([])
  const [unSavedFileIds, setUnSavedFileIds] = useState<string[]>([])
  const [recentlyUsedFiles, setRecentlyUsedFiles] = useState<FileItem[]>([])
  const files = objToArr(fileMap)
  const activeFile = fileMap[activeFileId]
  const openedFiles = openedFileIds.map(openId => {
    return fileMap[openId]
  })

  const fileList = files.sort((a, b) => b.createdAt - a.createdAt)

  const fileClick = async (fileId: string) => {
    setActiveFileId(fileId)
    const currentFile = fileMap[fileId]
    if (currentFile) {
      if (!currentFile.isLoaded) {
        const value = await readFile(currentFile.path)
        const newFile = { ...fileMap[fileId], body: String(value), isLoaded: true }
        setFileMap({ ...fileMap, [fileId]: newFile })
      }
      if (!openedFileIds.includes(fileId)) {
        setOpenedFileIds([...openedFileIds, fileId])
      }
      if (recentlyUsedFiles.filter(file => file.id === fileId).length === 0) {
        addRecentlyUsedFiles(currentFile)
      }
    }
  }

  const addRecentlyUsedFiles = (currentFile: FileItem) => {
    if (recentlyUsedFiles.length === RECENTLY_USED_FILES_MAX_LENGTH) {
      recentlyUsedFiles.pop()
    }
    setRecentlyUsedFiles([currentFile, ...recentlyUsedFiles])
  }

  const deleteFile = async (id: string) => {
    const item = fileMap[id]
    if (item) {
      if (item.isNew) {
        const { [id]: value, ...afterDelete } = fileMap
        setFileMap(afterDelete)
      } else {
        await removeFile(item.path)
        const { [id]: value, ...afterDelete } = fileMap
        setFileMap(afterDelete)
        saveFilesToStore(afterDelete)
        clearFileCache(id)
        tabClose(id)
      }
    }
  }

  const clearFileCache = (id: string) => {
    const newRecentlyUsedFiles = recentlyUsedFiles.filter(file => file.id !== id)
    if (newRecentlyUsedFiles.length < recentlyUsedFiles.length) {
      setRecentlyUsedFiles(newRecentlyUsedFiles)
    }
    const newOpenedFileIds = openedFileIds.filter(fileId => fileId !== id)
    if (newOpenedFileIds.length < openedFileIds.length) {
      setOpenedFileIds(newOpenedFileIds)
    }
    const newUnSavedFileIds = unSavedFileIds.filter(fileId => fileId !== id)
    if (newUnSavedFileIds.length < unSavedFileIds.length) {
      setUnSavedFileIds(newUnSavedFileIds)
    }
  }

  const updateFileName = async (id: string, title: string, isNew: boolean) => {
    const newPath = isNew ?
      join(await SAVED_LOCATION(), `${title}.md`) :
      join(dirname(fileMap[id].path), `${title}.md`)
    const modifiedFile = { ...fileMap[id], title, isNew: false, path: newPath }
    const newFileMap = { ...fileMap, [id]: modifiedFile }
    if (isNew) {
      await writeFile(newPath, fileMap[id].body)
      setFileMap(newFileMap)
      saveFilesToStore(newFileMap)
    } else {
      const oldPath = fileMap[id].path
      await renameFile(oldPath, newPath)
      setFileMap(newFileMap)
      saveFilesToStore(newFileMap)
    }
  }

  const createNewFile = () => {
    const newId = uuidV4()
    const newFile = {
      id: newId,
      title: '',
      body: '## 请编写 Markdown',
      path: '',
      createdAt: new Date().getTime(),
      isNew: true,
      isLoaded: false
    }
    setFileMap({ ...fileMap, [newId]: newFile })
  }

  const importFiles = () => { }

  const tabClick = (fileId: string) => {
    setActiveFileId(fileId)
  }

  const tabClose = (fileId: string) => {
    const tabsWithout = openedFileIds.filter(id => id !== fileId)
    setOpenedFileIds(tabsWithout)
    if (tabsWithout.length > 0) {
      setActiveFileId(tabsWithout[0])
    } else {
      setActiveFileId('')
    }
  }

  const onFileChange = useCallback((value: string) => {
    if (value !== fileMap[activeFileId].body) {
      const newFile = { ...fileMap[activeFileId], body: value }
      setFileMap({ ...fileMap, [activeFileId]: newFile })

      if (!unSavedFileIds.includes(activeFileId)) {
        setUnSavedFileIds([...unSavedFileIds, activeFileId])
      }
    }
  }, [activeFileId, fileMap, unSavedFileIds])

  const saveCurrentFile = async () => {
    const { path, body } = activeFile
    await writeFile(path, body)
    setUnSavedFileIds(unSavedFileIds.filter(id => id !== activeFile.id))
  }

  useIpcRenderer({
    'save-edit-file': saveCurrentFile,
    'create-new-file': createNewFile
  })

  return (
    <>
      <div className='d-flex w-100' style={{ minHeight: '100vh' }}>
        <div className='file-aside'>
          <FileSearch files={files} onClick={(id) => { fileClick(id) }}></FileSearch>
          <div className='list-title'>最近使用</div>
          <div className='recently-used-files'>
            <FileList
              key={'recentlyUsedFiles'}
              files={recentlyUsedFiles}
              onFileClick={fileClick}
              onFileDelete={deleteFile}
              onSaveEdit={updateFileName}
            />
          </div>
          <div className='list-title'>文件列表</div>
          <div className='file-aside-list'>
            <FileList
              key={'files'}
              files={fileList}
              onFileClick={fileClick}
              onFileDelete={deleteFile}
              onSaveEdit={updateFileName}
            />
          </div>
          <div style={{ position: 'fixed', bottom: 0, left: 0, width: '300px' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div className='w-50'>
                <BottomBtn
                  text="新建"
                  colorClass="btn btn-primary w-100 rounded-0"
                  icon={faPlus}
                  onBtnClick={createNewFile}
                />
              </div>
              <div className='w-50'>
                <BottomBtn
                  text="导入"
                  colorClass="btn btn-success w-100 rounded-0"
                  icon={faFileImport}
                  onBtnClick={importFiles}
                />
              </div>
            </div>
          </div>
        </div>
        <div className='flex-fill'>
          {!activeFile &&
            <div className="start-page">
              选择或者创建新的 Markdown 文档
            </div>
          }
          {activeFile &&
            <>
              <TabList
                files={openedFiles}
                activeFile={activeFile}
                unSaveIds={unSavedFileIds}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE
                key={activeFile.id}
                value={activeFile.body}
                onChange={onFileChange}
                options={{
                  minHeight: '482px',
                  previewRender: getPreviewRender(),
                }}
              />
            </>
          }
        </div>
      </div>
    </>
  );
}

export default App;
