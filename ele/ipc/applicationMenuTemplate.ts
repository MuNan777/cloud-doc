import { shell } from "electron"

export const applicationMenuTemplate: Electron.MenuItemConstructorOptions[] = [{
  label: '文件',
  submenu: [{
    label: '新建',
    accelerator: 'CmdOrCtrl+N',
    click: (menuItem, browserWindow, event) => {
      browserWindow?.webContents.send('create-new-file')
    }
  }, {
    label: '保存',
    accelerator: 'CmdOrCtrl+S',
    click: (menuItem, browserWindow, event) => {
      browserWindow?.webContents.send('save-edit-file')
    }
  }, {
    label: '搜索',
    accelerator: 'CmdOrCtrl+F',
    click: (menuItem, browserWindow, event) => {
      browserWindow?.webContents.send('search-file')
    }
  }, {
    label: '导入',
    accelerator: 'CmdOrCtrl+O',
    click: (menuItem, browserWindow, event) => {
      browserWindow?.webContents.send('import-file')
    }
  }]
},
{
  label: '视图',
  submenu: [
    {
      label: '刷新当前页面',
      accelerator: 'CmdOrCtrl+R',
      click: (menuItem, browserWindow) => {
        browserWindow?.webContents.reload()
      }
    },
    {
      label: '切换全屏幕',
      accelerator: (() => {
        if (process.platform === 'darwin')
          return 'Ctrl+Command+F';
        else
          return 'F11';
      })(),
      click: (menuItem, browserWindow) => {
        browserWindow?.setFullScreen(!browserWindow.isFullScreen());
      }
    },
    {
      label: '切换开发者工具',
      accelerator: (function () {
        if (process.platform === 'darwin')
          return 'Alt+Command+I';
        else
          return 'Ctrl+Shift+I';
      })(),
      click: (menuItem, browserWindow) => {
        browserWindow?.webContents.toggleDevTools()
      }
    },
  ]
},
{
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
},
{
  label: '帮助',
  role: 'help',
  submenu: [
    {
      label: '学习更多',
      click: () => { shell.openExternal('http://electron.atom.io') }
    },
  ]
}]