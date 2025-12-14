export type Action = {
    id: string
    code: string
    name: string
    description: string
    duration: number
    status: number
    icon: string
    createdDate: string
    lastUpdate: string
    canInterrupt: boolean
    robotModelId: string
    robotModelName: string
    statusText?: string
}

export type Dance = {
    id: string
    code: string
    name: string
    description: string
    status: number
    icon: string
    createdDate: string
    lastUpdate: string
    duration: number
    robotModelId: string
    robotModelName: string
    statusText: string
}

export type Expression = {
    id: string
    code: string
    name: string
    imageUrl: string
    status: number
    createdDate: string
    lastUpdate: string
    robotModelId: string
    robotModelName: string
    statusText: string
}

export type ExtendedAction = {
    id: string
    code: string
    icon: string
    name: string
    robotModelId: string
    robotModelName?: string
    status: number
    statusText: string
    createdDate: string
    lastUpdate: string
}

export type Skill = {
  id: string
  name: string
  code: string
  icon: string
  createdDate: string
  lastUpdated?: string
  robotModelId?: string
  robotModelName?: string
  status: number
  statusText: string
}