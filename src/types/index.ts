export interface FileItem {
  id: string
  title: string
  body: string
  path: string
  createdAt: number
  isNew: boolean
  isLoaded: boolean
  originBody: string
}

export type getPathType = "home" | "appData" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps"