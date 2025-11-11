export interface RobotAction {
  id: string;
  createdDate: string;
  lastUpdate: string;
  name: string;
  code: string;
  description: string;
  duration: number; // đơn vị ms
  icon: string | null;
  status: number;
  canInterrupt?: boolean;
  statusText: string;
}

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

export type RobotResponse = {
  robots: Robot[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_previous: boolean
}

export interface RobotAction {
  id: string;
  createdDate: string;
  lastUpdate: string;
  name: string;
  code: string;
  description: string;
  duration: number; // đơn vị ms
  icon: string | null;
  status: number;
  canInterrupt?: boolean;
  statusText: string;

}

// ========================
// Loại Expression (biểu cảm)
// ========================
export interface RobotExpression {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  status: number;
  createdDate: string;
  lastUpdate: string;
  statusText?: string;
}

// Response Expression
export interface RobotExpressionResponse {
  data: RobotExpression[];
  page: number;
  total_count: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Response chung cho Action
export interface RobotActionResponse {
  data: RobotAction[];
  page: number;
  total_count: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Loại Action (hành động cơ bản)
export interface RobotAction {
  id: string;
  createdDate: string;
  lastUpdate: string;
  name: string;
  code: string;
  description: string;
  duration: number; // đơn vị ms
  icon: string | null;
  status: number;
  canInterrupt?: boolean;
  statusText: string;
}

// Response chung cho Action
export interface RobotActionResponse {
  data: RobotAction[];
  page: number;
  total_count: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ========================
// Loại Dance (điệu nhảy)
// ========================
export interface RobotDance {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: number;
  icon: string | null;
  lastUpdate: string;
  createdDate: string;
  duration: number; // có thể là ms hoặc giây, cần confirm
  osmoCards?: string | null;
  statusText: string;
}

// Response Dance
export interface RobotDanceResponse {
  data: RobotDance[];
  page: number;
  total_count: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ========================
// Loại Expression (biểu cảm)
// ========================
export interface RobotExpression {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  status: number;
  createdDate: string;
  lastUpdate: string;
  statusText?: string;
}

// Response Expression
export interface RobotExpressionResponse {
  data: RobotExpression[];
  page: number;
  total_count: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}


export type RobotInfo = {
    serial_number: string
    firmware_version: string
    ctrl_version: string
    battery_level: string
    is_charging: boolean
}

export type RobotInfoResponse = {
    status: string
    message: string
    data: RobotInfo
}