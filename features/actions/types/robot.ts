export type Robot = {
  id: string
  serialNumber: string
  robotModelId: string
  robotModelName?: string
  ctrlVersion?: string
  firmwareVersion?: string
  battery?: string | null
  accountId: string
  status: number
  statusText?: string
  createdDate?: string
  lastUpdate?: string
}

export type RobotModel = {
  id: string
  name: string
  firmwareVersion: string
  ctrlVersion: string
  createdDate: string
  lastUpdated: string | null
  status: number
  statusText: string
}