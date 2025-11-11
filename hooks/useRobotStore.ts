import {
    addRobot,
    clearAllRobots,
    ConnectMode,
    fetchRobotsByAccount,
    fetchRobotsFromToken,
    removeRobot,
    resetError, // 💡 THÊM ACTION SET ROBOTS
    Robot,
    selectRobot,
    setConnectionStatus,
    setConnectMode,
    setRobots,
    updateRobotBattery,
    updateRobotInfo,
    updateRobotStatus
} from '@/store/robot-slice'
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './use-redux-hooks'

export const useRobotStore = () => {
  const dispatch = useAppDispatch()
  const {
    robots,
    selectedRobotSerial,
    isConnected,
    isLoading,
    error,
    accountId,
    connectMode,
  } = useAppSelector((state) => state.robot)

  const selectedRobot = Array.isArray(selectedRobotSerial)
    ? robots.find((r) => r.serialNumber === selectedRobotSerial[0]) 
    : robots.find((r) => r.serialNumber === selectedRobotSerial)

  // ✅ chỉ fetch robot list khi chưa có
  const initializeMockData = useCallback(() => {
    if (robots.length === 0 && !isLoading) {
      dispatch(fetchRobotsFromToken())
    }
  }, [dispatch, robots.length, isLoading])

  return {
    // -------------------
    // 📦 STATE
    // -------------------
    robots,
    selectedRobotSerial,
    selectedRobot,
    isConnected,
    isLoading,
    error,
    accountId,
    connectMode,

    // -------------------
    // ⚙️ ACTIONS
    // -------------------
    // ✅ ACTION MỚI: Dùng để đồng bộ danh sách robots từ API
    setRobots: useCallback((newRobots: Robot[]) => dispatch(setRobots(newRobots)), [dispatch]),
    
    addRobot: useCallback((robot: Robot) => dispatch(addRobot(robot)), [dispatch]),
    removeRobot: useCallback((serial: string) => dispatch(removeRobot(serial)), [dispatch]),
    updateRobotStatus: useCallback(
      (serial: string, status: Robot['status']) =>
        dispatch(updateRobotStatus({ serial, status })),
      [dispatch]
    ),
    selectRobot: useCallback((serial: string) => dispatch(selectRobot(serial)), [dispatch]),
    setConnectionStatus: useCallback(
      (connected: boolean) => dispatch(setConnectionStatus(connected)),
      [dispatch]
    ),
    updateRobotInfo: useCallback(
      (info: Partial<Robot> & { serial: string }) => dispatch(updateRobotInfo(info)),
      [dispatch]
    ),
    updateRobotBattery: useCallback(
      (serial: string, battery: string | null) =>
        dispatch(updateRobotBattery({ serial, battery })),
      [dispatch]
    ),
    clearAllRobots: useCallback(() => dispatch(clearAllRobots()), [dispatch]),
    resetError: useCallback(() => dispatch(resetError()), [dispatch]),

    setConnectMode: useCallback(
      (mode: ConnectMode) => dispatch(setConnectMode(mode)),
      [dispatch]
    ),

    toggleConnectMode: useCallback(() => {
      dispatch(setConnectMode(connectMode === 'single' ? 'multi' : 'single'))
    }, [dispatch, connectMode]),

    // -------------------
    // 🔄 ASYNC ACTIONS
    // -------------------
    fetchRobotsByAccount: useCallback(
      (accountId: string) => dispatch(fetchRobotsByAccount(accountId)),
      [dispatch]
    ),
    fetchRobotsFromToken: useCallback(
      () => dispatch(fetchRobotsFromToken()),
      [dispatch]
    ),

    // -------------------
    // 🧩 Legacy helper
    // -------------------
    initializeMockData,
  }
}