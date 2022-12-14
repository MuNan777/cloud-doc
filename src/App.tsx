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

const files = [{
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

function App () {
  const [activeFile, setActiveFile] = useState<FileItem | null>(null)
  const [openedFiles, setOpenedFiles] = useState<FileItem[]>([])
  const [unSavedFiles, setUnSavedFiles] = useState<FileItem[]>([])

  const fileSearch = (keyword: string | boolean) => {
    console.log(keyword)
    setUnSavedFiles([files[0]])
  }

  const fileClick = (fileId: string) => {
    const file = files.find(file => file.id === fileId)
    if (file) {
      setActiveFile(file)
      const currentFile = files.find((file) => file.id === fileId)
      if (currentFile) {
        console.log(openedFiles)
        setOpenedFiles((openedFiles) => {
          if (!openedFiles.includes(currentFile)) {
            return [...openedFiles, currentFile]
          }
          return [...openedFiles]
        })
      }
    }
  }

  const deleteFile = (id: string) => {
    const file = files.find(file => file.id === id)
    if (file) {
      console.log(file)
      tabClose(file)
    }
  }

  const updateFileName = (id: string, title: string, isNew: boolean) => {
    console.log(id, title, isNew)
  }

  const createNewFile = () => { }

  const importFiles = () => { }

  const tabClick = (file: FileItem) => {
    setActiveFile(file)
  }

  const tabClose = (file: FileItem) => {
    const tabsWithout = openedFiles.filter(item => item.id !== file.id)
    setOpenedFiles(tabsWithout)
    if (tabsWithout.length > 0) {
      setActiveFile(tabsWithout[0])
    } else {
      setActiveFile(null)
    }
  }

  const onMdeChange = useCallback((value: string) => {
    console.log(value)
  }, [])

  return (
    <>
      <div className='d-flex w-100' style={{ height: '100vh' }}>
        <div className='d-flex flex-column justify-content-between' style={{ width: '350px' }}>
          <div>
            <FileSearch
              title='My Document'
              onSearch={fileSearch}
            />
            <FileList
              files={files}
              onFileClick={fileClick}
              onFileDelete={deleteFile}
              onSaveEdit={updateFileName}
            />
          </div>
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
                unSaveFiles={unSavedFiles}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE value={activeFile.body} onChange={onMdeChange} />
            </>
          }
        </div>
      </div>
    </>
  );
}

export default App;
