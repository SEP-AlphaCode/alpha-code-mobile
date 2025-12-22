"use client"

import PagedResultBrowser from '@/components/paged-result-browser/paged-result-browser'
import { RobotSelectorSmall } from '@/components/RobotSelectorSmall'
import { sendCommand } from '@/features/actions/api/api'
import { useExpressions } from '@/features/actions/hooks/useApi'
import { Expression } from '@/features/actions/types/actions'
import { RootState } from '@/store/store'
import { Ionicons } from '@expo/vector-icons'
import { createSelector } from '@reduxjs/toolkit'
import { LinearGradient } from 'expo-linear-gradient'
import { useMemo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
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

export default function ExpressionsPage() {
  const COL = 4, ROW = 2

  const currentRobot = useSelector(selectCurrentRobot)
  const shouldRun = currentRobot.length === 1

  // Use the new hook that fetches all pages
  const { allPagesData, isLoading, totalPages } = useExpressions({
    size: COL * ROW,
    robotModelId: shouldRun ? currentRobot[0].robotModelId : undefined,
    shouldRun
  })

  // Memoize the common JSX
  const renderContent = useMemo(() => (
    <PagedResultBrowser<Expression>
      columnCount={COL}
      rowCount={ROW}
      isLoading={isLoading}
      allPagesData={allPagesData}
      totalPages={totalPages}
      itemDetailFn={(item) => (
        <View style={styles.detailCard}>
          <LinearGradient
            colors={['#ffecd2', '#fcb69f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailGradient}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.detailImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.detailIcon}>{item.name?.charAt(0) || '?'}</Text>
            )}
            <Text style={styles.detailName}>{item.name}</Text>
          </LinearGradient>
        </View>
      )}
      listItemFn={(item, id, isSelected) => (
        <View style={[
          styles.actionCard,
          isSelected && styles.actionCardSelected
        ]}>
          <View style={[
            styles.iconCircle,
            isSelected && styles.iconCircleSelected
          ]}>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.actionImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.actionIcon}>{item.name?.charAt(0) || '?'}</Text>
            )}
          </View>
          <Text
            numberOfLines={2}
            style={[
              styles.actionName,
              { fontSize: item.name.length >= 10 ? 9 : 11 }
            ]}>
            {item.name}
          </Text>
        </View>
      )}
      onPageChange={(page) => {
      }}
      onItemSelect={(item) => {
        sendCommand(currentRobot[0].serialNumber, {
          type: 'expression',
          data: {
            code: item.code
          }
        })
          .then((value) => {
            const status = value.status
            if (status === 'failed') {
              Toast.show({
                type: 'error',
                text1: 'Không thể gửi lệnh cho robot. Kiểm tra robot có đang hoạt động không.',
                position: 'top'
              });
              return;
            }
            Toast.show({
              type: 'success',
              text1: 'Gửi lệnh cho robot thành công',
              position: 'top'
            });
          })
          .catch((reason) => {
            Toast.show({
              type: 'error',
              text1: 'Hệ thống đã gặp lỗi. Vui lòng thử lại sau.',
              position: 'top'
            });
          })
      }}
    />
  ), [allPagesData, isLoading, totalPages])

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#ffecd2', '#fcb69f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Ionicons name="happy" size={28} color="#fff" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Biểu cảm</Text>
              <Text style={styles.headerSubtitle}>Chọn biểu cảm cho AlphaMini</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.robotSelectorContainer}>
        <RobotSelectorSmall />
      </View>
      <View style={styles.contentContainer}>
        {renderContent}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  robotSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  contentContainer: {
    flex: 1,
    padding: 0,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    margin: 6,
  },
  actionCardSelected: {
    borderColor: '#fcb69f',
    backgroundColor: '#fffbf7',
    shadowColor: '#fcb69f',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fed7aa',
    overflow: 'hidden',
  },
  iconCircleSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#fcb69f',
  },
  actionIcon: {
    fontSize: 28,
    textAlign: 'center',
  },
  actionImage: {
    width: '100%',
    height: '100%',
  },
  actionName: {
    textAlign: 'center',
    color: '#1e293b',
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 8,
  },
  detailCard: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  detailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  detailIcon: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});