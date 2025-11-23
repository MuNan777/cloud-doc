/// <reference types="react-scripts" />

interface ElectronAPI {
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string | NodeJS.ArrayBufferView) => Promise<void>;
  renameFile: (path: string, newPath: string) => Promise<void>;
  removeFile: (path: string) => Promise<void>;
  mkDir: (path: string) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  showOpenDialog: (options: any) => Promise<any>;
  showMessageBox: (options: any, windowName?: string) => Promise<any>;
  getPath: (path: string) => Promise<string>;
  contextmenu: (items: any[]) => void;
  contextmenuPopup: () => Promise<void>;
  onContextmenuClick: (callback: (args: any) => void) => void;
}

declare interface Window {
  electronAPI: ElectronAPI;
}
