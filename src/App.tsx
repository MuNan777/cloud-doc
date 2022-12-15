import React, { useCallback, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSearch from './compoments/FileSearch';
import FileList from './compoments/FileList';
import BottomBtn from './compoments/BottomBtn';
import { faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons';
import TabList from './compoments/TabList';
import { FileItem } from './types';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { getPreviewRender, objToArr } from './utils/common';
import { v4 as uuidV4 } from 'uuid'

const defaultFiles = [{
  id: '1',
  title: 'first post',
  body: 'should be aware of this',
  createdAt: 123456,
  isNew: false,
}, {
  id: '2',
  title: 'second post',
  body: '## this is the title',
  createdAt: 123456,
  isNew: false,
}] as FileItem[]

const defaultFileMap: { [key: string]: FileItem } = {};

for (let file of defaultFiles) {
  defaultFileMap[file.id] = file
}

function App () {
  const [fileMap, setFileMap] = useState<{ [key: string]: FileItem }>(defaultFileMap)
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState<string[]>([])
  const [unSavedFileIds, setUnSavedFileIds] = useState<string[]>([])
  const [searchedFiles, setSearchedFiles] = useState<FileItem[]>([])

  const files = objToArr(fileMap)
  const activeFile = fileMap[activeFileId]
  const openedFiles = openedFileIds.map(openId => {
    return fileMap[openId]
  })

  const fileList = (searchedFiles.length > 0) ? searchedFiles : files

  const fileSearch = (keyword: string) => {
    const newFiles = files.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  const fileClick = (fileId: string) => {
    setActiveFileId(fileId)
    const currentFile = fileMap[fileId]
    if (currentFile) {
      if (!openedFileIds.includes(fileId)) {
        setOpenedFileIds([...openedFileIds, fileId])
      }
    }
  }

  const deleteFile = (id: string) => {
    if (fileMap[id]?.isNew) {
      const { [id]: value, ...afterDelete } = fileMap
      setFileMap(afterDelete)
    } else {
      const { [id]: value, ...afterDelete } = fileMap
      setFileMap(afterDelete)
      tabClose(id)
    }
  }

  const updateFileName = (id: string, title: string, isNew: boolean) => {
    const modifiedFile = { ...fileMap[id], title, isNew: false }
    const newFiles = { ...fileMap, [id]: modifiedFile }
    if (isNew) {
      setFileMap(newFiles)
    } else {
      setFileMap(newFiles)
    }
  }

  const createNewFile = () => {
    const newId = uuidV4()
    const newFile = {
      id: newId,
      title: '',
      body: '## 请编写 Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
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


  return (
    <>
      <div className='d-flex w-100' style={{ minHeight: '100vh' }}>
        <div style={{ width: '300px' }}>
          <FileSearch
            title='My Document'
            onSearch={fileSearch}
          />
          <FileList
            files={fileList}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          />
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
