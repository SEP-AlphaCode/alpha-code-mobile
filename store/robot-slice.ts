import { getRobotsByAccountId } from '@/api/robot/robot-api'
import { Robot as ApiRobot } from '@/types/robot'
import { getUserIdFromToken } from '@/utils/tokenUtils'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

// --------------------
// 🔧 Type definitions
// --------------------
export type ConnectMode = 'single' | 'multi'

export interface Robot {
  name: string
  id: string
  serialNumber: string
  robotModelId: string
  robotModelName?: string
  ctrlVersion?: string
  firmwareVersion?: string
  battery?: string | null
  accountId: string
  status: 'online' | 'offline' | 'busy' | 'charging'
  statusText?: string
  createdDate?: string
  lastUpdate?: string
  isSelected?: boolean 
}

interface RobotState {
  robots: Robot[]
  selectedRobotSerial: string | string[] | null
  isConnected: boolean
  isLoading: boolean
  error: string | null
  accountId: string | null
  connectMode: ConnectMode
}

// --------------------
// ⚙️ Async actions
// --------------------
export const fetchRobotsByAccount = createAsyncThunk(
  'robots/fetchByAccount',
  async (accountId: string) => {
    const response = await getRobotsByAccountId(accountId)
    return response.data || []
  }
)

export const fetchRobotsFromToken = createAsyncThunk(
  'robots/fetchFromToken',
  async (_, { getState }) => {
    const state = getState() as { robot: RobotState }

    if (state.robot.isLoading) {
      throw new Error('Request already in progress')
    }

    if (typeof window !== 'undefined') {
      const accessToken = sessionStorage.getItem('accessToken')
      if (accessToken) {
        const accountId = getUserIdFromToken(accessToken)
        if (accountId) {
          const response = await getRobotsByAccountId(accountId)
          const robots = response.data || []
          return { robots, accountId }
        }
      }
    }
    throw new Error('No valid token found')
  }
)

// --------------------
// 🧩 Initial state
// --------------------
const initialState: RobotState = {
  robots: [],
  selectedRobotSerial: null,
  isConnected: false,
  isLoading: false,
  error: null,
  accountId: null,
  connectMode: 'single',
}

// --------------------
// 🔄 Helper converter
// --------------------
const convertApiRobotToReduxRobot = (apiRobot: ApiRobot): Robot => ({
  id: apiRobot.id,
  serialNumber: apiRobot.serialNumber,
  name: apiRobot.robotModelName || apiRobot.robotModelName || 'Unknown Robot',
  status:
    apiRobot.status === 1
      ? 'online'
      : apiRobot.status === 2
        ? 'busy'
        : apiRobot.status === 3
          ? 'charging'
          : 'offline',
  isSelected: false,
  battery: apiRobot.battery != null ? String(apiRobot.battery) : null,
  robotModelId: apiRobot.robotModelId,
  robotModelName: apiRobot.robotModelName,
  accountId: apiRobot.accountId,
  ctrlVersion: apiRobot.ctrlVersion ,
  firmwareVersion: apiRobot.firmwareVersion ,
})


// --------------------
// 🧠 Slice
// --------------------
const robotSlice = createSlice({
  name: 'robot',
  initialState,
  reducers: {
    // ✅ THÊM REDUCER MỚI: Thay thế toàn bộ mảng robots
    setRobots: (state, action: PayloadAction<Robot[]>) => {
      state.robots = action.payload;
      // Cập nhật trạng thái isSelected dựa trên selectedRobotSerial hiện tại
      const selectedSerials = Array.isArray(state.selectedRobotSerial)
        ? state.selectedRobotSerial
        : state.selectedRobotSerial ? [state.selectedRobotSerial] : [];

      state.robots.forEach(robot => {
        robot.isSelected = selectedSerials.includes(robot.serialNumber);
      });
    },
    
    addRobot: (state, action: PayloadAction<Robot>) => {
      const existing = state.robots.find(r => r.serialNumber === action.payload.serialNumber)
      if (!existing) state.robots.push(action.payload)
    },

    removeRobot: (state, action: PayloadAction<string>) => {
      state.robots = state.robots.filter(r => r.serialNumber !== action.payload)
      if (state.selectedRobotSerial === action.payload) {
        state.selectedRobotSerial =
          state.robots.length > 0 ? state.robots[0].serialNumber : null
      }
    },

    updateRobotStatus: (
      state,
      action: PayloadAction<{ serial: string; status: Robot['status'] }>
    ) => {
      const robot = state.robots.find(r => r.serialNumber === action.payload.serial)
      if (robot) {
        robot.status = action.payload.status
      }
    },

    selectRobot: (state, action: PayloadAction<string>) => {
      if (state.connectMode === 'multi') {
        const current = Array.isArray(state.selectedRobotSerial)
          ? state.selectedRobotSerial
          : state.selectedRobotSerial
            ? [state.selectedRobotSerial]
            : []

        if (current.includes(action.payload)) {
          state.selectedRobotSerial = current.filter(s => s !== action.payload)
        } else {
          state.selectedRobotSerial = [...current, action.payload]
        }

        state.robots.forEach(robot => {
          robot.isSelected = (state.selectedRobotSerial as string[]).includes(robot.serialNumber)
        })
      } else {
        state.selectedRobotSerial = action.payload
        state.robots.forEach(robot => {
          robot.isSelected = robot.serialNumber === action.payload
        })
      }
    },

    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },

    updateRobotInfo: (state, action) => {
      state.robots = state.robots.map(r =>
        r.serialNumber === action.payload.serial
          ? { ...r, ...action.payload }
          : r
      )
    },

    updateRobotBattery: (state, action) => {
      state.robots = state.robots.map(r =>
        r.serialNumber === action.payload.serial
          ? { ...r, battery: action.payload.battery ? String(action.payload.battery) : null }
          : r
      )
    },

    clearAllRobots: state => {
      state.robots = []
      state.selectedRobotSerial = null
      state.isConnected = false
      state.accountId = null
    },

    resetError: state => {
      state.error = null
    },

    setConnectMode: (state, action: PayloadAction<ConnectMode>) => {
      const newMode = action.payload
      state.connectMode = newMode

      if (newMode === 'single' && Array.isArray(state.selectedRobotSerial)) {
        state.selectedRobotSerial = state.selectedRobotSerial[0] ?? null
      }

      state.robots.forEach(robot => {
        robot.isSelected = Array.isArray(state.selectedRobotSerial)
          ? state.selectedRobotSerial.includes(robot.serialNumber)
          : robot.serialNumber === state.selectedRobotSerial
      })
    },
  },

  // --------------------
  // 🔁 Extra reducers
  // --------------------
  extraReducers: builder => {
    builder
      .addCase(fetchRobotsByAccount.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRobotsByAccount.fulfilled, (state, action) => {
        state.isLoading = false
        const robots = action.payload.map(convertApiRobotToReduxRobot)
        if (robots.length > 0) {
          state.robots = JSON.parse(JSON.stringify(robots)) 
          if (!state.selectedRobotSerial) {
            state.selectedRobotSerial = robots[0].serialNumber
            state.robots[0].isSelected = true
          }
        }
      })
      .addCase(fetchRobotsByAccount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch robots'
      })
      .addCase(fetchRobotsFromToken.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRobotsFromToken.fulfilled, (state, action) => {
        state.isLoading = false
        const robots = action.payload.robots.map(convertApiRobotToReduxRobot)
        state.accountId = action.payload.accountId
        if (robots.length > 0) {
          state.robots = robots // ✅ Đây là nơi robots được thay thế khi fetch từ token
          if (!state.selectedRobotSerial) {
            state.selectedRobotSerial = robots[0].serialNumber
            state.robots[0].isSelected = true 
          }
        }
      })
      .addCase(fetchRobotsFromToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch robots from token'
      })
  },
})

// --------------------
// 🧩 Export
// --------------------
export const {
    // ✅ EXPORT ACTION MỚI
    setRobots,
  addRobot,
  removeRobot,
  updateRobotStatus,
  selectRobot,
  setConnectionStatus,
  updateRobotInfo,
  updateRobotBattery,
  clearAllRobots,
  resetError,
  setConnectMode,
} = robotSlice.actions

export default robotSlice.reducer