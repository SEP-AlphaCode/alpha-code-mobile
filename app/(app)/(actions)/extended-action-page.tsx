import { useExtendedActions } from '@/features/actions/hooks/useApi'
import React, { useState } from 'react'
import { View } from 'react-native'

export default function SkillsPage() {
  const [page, setPage] = useState(1)
  const COL = 4, ROW = 2
  const { data, isLoading, isError } = useExtendedActions({ page: page, size: COL * ROW })
  return (
    <View style={{ flex: 1 }}>
      {/* <PagedResultBrowser<ExtendedAction>
        columnCount={COL}
        rowCount={ROW}
        isLoading={isLoading}
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
        data={data}
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
                fontSize: item.name.length >= 10 ? 9 : 12,
                flex: 1,
              }}>
              {item.name}
            </Text>
          </View>
        )}
        onPageChange={(page) => setPage(page)}
        onItemSelect={(item) => {
          sendCommand('030006KFK18081800461', {
            type: 'extended_action',
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
      /> */}
    </View>
  )
}