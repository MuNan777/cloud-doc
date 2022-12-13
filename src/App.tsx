import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSearch from './compoments/FileSearch';
import FileList from './compoments/FileList';

function App () {

  const [activeFileID, setActiveFileID] = useState('')

  const fileSearch = (keyword: string | boolean) => {
    console.log(keyword)
  }

  const fileListArr = [{
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
    isNew: true,
  }]

  const fileClick = (fileId?: string) => {
    if (fileId) {
      setActiveFileID(fileId)
      const currentFile = fileListArr[parseInt(fileId)]
      const { id, title, } = currentFile
      console.log(id, title)
    }
  }

  const deleteFile = (id?: string) => {
    if (id) {
      console.log(id)
    }
  }

  const updateFileName = (id: string, title: string, isNew: boolean) => {
    console.log(id, title, isNew)
  }

  return (
    <>
      <div className="App container-fluid">
        <div className='row'>
          <div className='col-3 bg-danger left-panel'>
            <FileSearch
              title='My Document'
              onSearch={fileSearch}
            />
            <FileList
              files={fileListArr}
              onFileClick={fileClick}
              onFileDelete={deleteFile}
              onSaveEdit={updateFileName}
            />
          </div>
          <div className='col-9 bg-primary right-panel'>
            <h1>right</h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
