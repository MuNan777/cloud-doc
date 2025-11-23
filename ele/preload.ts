// import * as fs from 'fs';
import { contextBridge, ipcRenderer, shell, clipboard } from 'electron';
import { Stream } from 'node:stream';

type ContentType = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream;

contextBridge.exposeInMainWorld('electronAPI', {
  // fs,
  // path,
  // os,
  // ipcRenderer,
  // shell,
  // clipboard,
  // 兼容原有 API
  readFile: (filePath: string, options?: { encoding?: BufferEncoding }) => fs.promises.readFile(filePath, options || { encoding: 'utf8' }),
  writeFile: (filePath: string, content: ContentType, options?: { encoding?: BufferEncoding }) => fs.promises.writeFile(filePath, content, options || { encoding: 'utf8' }),
  renameFile: (oldPath: string, newPath: string) => fs.promises.rename(oldPath, newPath),
  removeFile: (filePath: string) => fs.promises.unlink(filePath),
  mkDir: (dirPath: string, options?: { recursive?: boolean }) => fs.promises.mkdir(dirPath),
  exists: async (filePath: string) => {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch (err: any) {
      if (err.code === 'ENOENT') return false;
      throw err;
    }
  },
  showOpenDialog: (options: any[]) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options: any[], windowName: string) => ipcRenderer.invoke('show-message-box', options, windowName),
  getPath: (name: string) => ipcRenderer.invoke('get-path', name),
  contextmenu: (items: any[]) => ipcRenderer.send('contextmenu', items),
  contextmenuPopup: () => ipcRenderer.invoke('contextmenu-popup'),
  onContextmenuClick: (callback: (args: any[]) => {}) => ipcRenderer.on('contextmenu-click', (event, args) => callback(args)),
});