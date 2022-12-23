import React, { useCallback, useState } from 'react'
import FileSearch from './components/FileSearch'
import BottomBtn from './components/BottomBtn'
import { faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons'
import TabList from './components/TabList'
import { FileItem } from './types'
import SimpleMDE from "react-simplemde-editor"
import { flattenArr, getPreviewRender, objToArr } from './utils/common'
import { v4 as uuidV4 } from 'uuid'
import { exists, mkDir, readFile, removeFile, renameFile, writeFile } from './utils/fileHelper'
import Store from 'electron-store'
import { RECENTLY_USED_FILES_MAX_LENGTH, SAVED_LOCATION } from './config'
import useIpcRenderer from './hooks/useIpcRenderer'
import useFileListsWithContext from './hooks/useFileListsWithContext'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import "easymde/dist/easymde.min.css"
import { showMessageBox, showOpenDialog } from './ipc/ipcRenderer'
import { basename, extname } from 'path'

const { join, dirname } = window.require('path')

export interface FileMapProps { [key: string]: FileItem }

const fileStore = new Store<Record<string, FileMapProps>>({ 'name': 'Files Data' })

const ruIdsStore = new Store<Record<string, string[]>>({ 'name': 'Recently Used File Ids' })

const saveFilesToStore = (fileMap: FileMapProps) => {
  const fileStoreObj = objToArr(fileMap).reduce<{ [key: string]: FileItem }>((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id, path, title, createdAt, body: '', isNew: false, isLoaded: false, originBody: ''
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
  const [recentlyUsedFileIds, setRecentlyUsedFileIds] = useState<string[]>(ruIdsStore.get('ids') || [])
  const files = objToArr(fileMap)
  const activeFile = fileMap[activeFileId]
  const openedFiles = openedFileIds.map(openId => {
    return fileMap[openId]
  })
  const recentlyUsedFiles = recentlyUsedFileIds.map(id => {
    return fileMap[id]
  })

  const fileList = files.sort((a, b) => b.createdAt - a.createdAt)

  const fileClick = async (fileId: string) => {
    setActiveFileId(fileId)
    const currentFile = fileMap[fileId]
    if (currentFile) {
      if (!currentFile.isLoaded) {
        const value = await readFile(currentFile.path)
        const newFile = { ...fileMap[fileId], body: String(value), isLoaded: true, originBody: String(value) }
        setFileMap({ ...fileMap, [fileId]: newFile })
      }
      if (!openedFileIds.includes(fileId)) {
        setOpenedFileIds([...openedFileIds, fileId])
      }
      if (recentlyUsedFileIds.filter(id => id === fileId).length === 0) {
        addRecentlyUsedFiles(fileId)
      }
    }
  }

  const addRecentlyUsedFiles = (id: string) => {
    if (recentlyUsedFileIds.length === RECENTLY_USED_FILES_MAX_LENGTH) {
      recentlyUsedFileIds.pop()
    }
    const newRuIds = [id, ...recentlyUsedFileIds]
    setRecentlyUsedFileIds(newRuIds)
    ruIdsStore.set('ids', newRuIds)
  }

  const deleteFile = async (id: string) => {
    const item = fileMap[id]
    if (item) {
      if (item.isNew) {
        const { [id]: value, ...afterDelete } = fileMap
        setFileMap(afterDelete)
      } else {
        const data = await showMessageBox({
          type: 'info',
          buttons: ['取消', '确定删除', '确定删除, 同时删除源文件'],
          title: "提示",
          message: `是否确定删除？`,
          defaultId: 0,
          cancelId: 0
        })
        if (data.response !== 0) {
          if (data.response === 2) {
            await removeFile(item.path)
          }
          const { [id]: value, ...afterDelete } = fileMap
          setFileMap(afterDelete)
          saveFilesToStore(afterDelete)
          clearFileCache(id)
          tabClose(id)
        }
      }
    }
  }

  const clearFileCache = (id: string) => {
    const newRecentlyUsedFileIds = recentlyUsedFileIds.filter(fileId => fileId !== id)
    if (newRecentlyUsedFileIds.length < recentlyUsedFileIds.length) {
      setRecentlyUsedFileIds(newRecentlyUsedFileIds)
      ruIdsStore.set('ids', newRecentlyUsedFileIds)
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
      isLoaded: false,
      originBody: '## 请编写 Markdown'
    }
    setFileMap({ ...fileMap, [newId]: newFile })
  }

  const importFiles = async () => {
    const data = await showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] }
      ]
    })
    if (data && Array.isArray(data.filePaths)) {
      const paths = data.filePaths as Array<string>
      const filteredPaths = paths.filter(path => {
        const already = fileList.find(file => file.path === path)
        return !already
      })
      const importFilesArr = filteredPaths.map(path => {
        return {
          id: uuidV4(),
          title: `${basename(path, extname(path))} (import)`,
          path,
          body: '',
          createdAt: new Date().getTime(),
          isNew: false,
          isLoaded: false,
          originBody: ''
        }
      })

      const newFiles = { ...fileMap, ...flattenArr(importFilesArr) }
      setFileMap(newFiles)
      saveFilesToStore(newFiles)
      if (importFilesArr.length > 0) {
        showMessageBox({
          type: 'info',
          title: `导入成功`,
          message: `导入了${importFilesArr.length}个文件`,
        })
      }
    }
  }

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
    if (value === fileMap[activeFileId].originBody) {
      setUnSavedFileIds(unSavedFileIds.filter(id => id !== activeFile.id))
    }
  }, [activeFile, activeFileId, fileMap, unSavedFileIds])

  const saveCurrentFile = async () => {
    const { path, body } = activeFile
    await writeFile(path, body)
    const newFile = { ...fileMap[activeFileId], originBody: body }
    setFileMap({ ...fileMap, [activeFileId]: newFile })
    setUnSavedFileIds(unSavedFileIds.filter(id => id !== activeFile.id))
  }

  useIpcRenderer({
    'save-edit-file': saveCurrentFile,
    'create-new-file': createNewFile,
    'import-file': importFiles
  })

  const [ruFileList, flFileList] = useFileListsWithContext({
    files,
    onFileClick: fileClick,
    onSaveEdit: updateFileName,
    onFileDelete: deleteFile,
    markAndFiles: [{ mark: 'ru', files: recentlyUsedFiles }, { mark: 'fl', files: fileList }]
  })

  return (
    <>
      <div className='d-flex w-100' style={{ minHeight: '100vh' }}>
        <div className='file-aside'>
          <FileSearch files={files} onClick={(id) => { fileClick(id) }}></FileSearch>
          {recentlyUsedFileIds.length > 0 && <>
            <div className='list-title'>最近使用</div>
            <div className='recently-used-files'>
              {ruFileList}
            </div></>}
          <div className='list-title'>文件列表</div>
          <div className='file-aside-list'>
            {flFileList}
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
                  autofocus: true,
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
