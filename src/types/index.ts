export interface FileItemProps {
  id: string
  title: string
  body: string
  path: string
  createdAt: number
  updatedAt: number
  isNew: boolean
  isLoaded: boolean
  originBody: string
  isSynced: boolean
}

export class FileItem {
  id: string = ''
  title: string = ''
  body: string = ''
  path: string = ''
  createdAt: number = -1
  updatedAt: number = -1
  isNew: boolean = false
  isLoaded: boolean = false
  originBody: string = ''
  isSynced: boolean = false

  constructor(options: Partial<FileItemProps>) {
    this.id = options.id || ''
    this.title = options.title || ''
    this.body = options.body || ''
    this.path = options.path || ''
    this.createdAt = options.createdAt || -1
    this.updatedAt = options.updatedAt || -1
    this.isNew = options.isNew || false
    this.isLoaded = options.isLoaded || false
    this.originBody = options.originBody || ''
    this.isSynced = options.isSynced || false
  }
}

export type getPathType = "home" | "appData" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps"