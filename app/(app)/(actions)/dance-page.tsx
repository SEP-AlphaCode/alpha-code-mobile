"use client"

import PagedResultBrowser from '@/components/paged-result-browser/paged-result-browser'
import { RobotSelectorSmall } from '@/components/RobotSelectorSmall'
import { sendCommand } from '@/features/actions/api/api'
import { useDances } from '@/features/actions/hooks/useApi'
import { Dance } from '@/features/actions/types/actions'
import { RootState } from '@/store/store'
import { createSelector } from '@reduxjs/toolkit'
import { useMemo } from 'react'
import { Text, View } from 'react-native'
import Toast from 'react-native-toast-message'
import { useSelector } from 'react-redux'

// Create memoized selectors
const selectSelectedRobotSerial = (state: RootState) => state.robot.selectedRobotSerial
const selectRobots = (state: RootState) => state.robot.robots

const selectCurrentRobot = createSelector(
  [selectSelectedRobotSerial, selectRobots],
  (selectedRobotSerial, robots) => {
    const serial = Array.isArray(selectedRobotSerial) ? selectedRobotSerial[0] : selectedRobotSerial
    return robots.filter(r => r.serialNumber === serial)
  }
)

export default function DancesPage() {
  const COL = 4, ROW = 2

  const currentRobot = useSelector(selectCurrentRobot)
  const shouldRun = currentRobot.length === 1

  // Use the new hook that fetches all pages
  const { allPagesData, isLoading, totalPages } = useDances({
    size: COL * ROW,
    robotModelId: shouldRun ? currentRobot[0].robotModelId : undefined,
    shouldRun
  })

  // Memoize the common JSX
  const renderContent = useMemo(() => (
    <PagedResultBrowser<Dance>
      columnCount={COL}
      rowCount={ROW}
      isLoading={isLoading}
      allPagesData={allPagesData}
      totalPages={totalPages}
      itemDetailFn={(item) => (
        <View style={{
          elevation: 1,
          padding: 5,
          borderWidth: 0.1,
          width: '75%',
          height: '75%',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto'
        }}>
          <Text>{item.icon}</Text>
          <Text>{item.name}</Text>
        </View>
      )}
      listItemFn={(item, id, isSelected) => (
        <View style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 5,
        }}>
          <Text style={{
            aspectRatio: 1,
            textAlign: 'center',
            textAlignVertical: 'center',
            borderRadius: 999,
            borderWidth: isSelected ? 1.5 : 1,
            flex: 2,
            borderColor: isSelected ? '#0b0' : '#ccc',
          }}>
            {item.icon}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              textAlign: 'center',
              textAlignVertical: 'center',
              fontSize: item.name.length >= 10 ? 10 : 12,
              flex: 1,
            }}>
            {item.name}
          </Text>
        </View>
      )}
      onPageChange={(page) => {
        // Optional: if you need to track page changes for analytics etc.
        console.log('Page changed to:', page);
      }}
      onItemSelect={(item) => {
        sendCommand('030006KFK18081800461', {
          type: 'action',
          data: {
            code: item.code
          }
        })
          .then((value) => {
            const status = value.status
            if (status === 'failed') {
              Toast.show({
                type: 'error',
                text1: 'Gửi lệnh thất bại',
                text2: 'Không thể gửi lệnh cho robot. Kiểm tra robot có đang hoạt động không.',
                position: 'bottom',
                avoidKeyboard: true
              });
              return;
            }
            Toast.show({
              type: 'success',
              text1: 'Thành công',
              text2: 'Gửi lệnh cho robot thành công.',
              position: 'bottom'
            });
          })
          .catch((reason) => {
            Toast.show({
              type: 'error',
              text1: 'Gửi lệnh thất bại',
              text2: 'Hệ thống đã gặp lỗi. Vui lòng thử lại sau.',
              position: 'bottom'
            });
          })
      }}
    />
  ), [allPagesData, isLoading, totalPages])

  return (
    <View style={{ flex: 1 }}>
      <RobotSelectorSmall />
      {renderContent}
    </View>
  )
}