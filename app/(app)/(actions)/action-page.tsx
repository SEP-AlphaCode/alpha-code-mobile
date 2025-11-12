import PagedResultBrowser from '@/components/paged-result-browser/paged-result-browser'
import { useActions } from '@/features/actions/hooks/useAction'
import { Action } from '@/features/actions/types/actions'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

export default function ActionsPage() {
  const [page, setPage] = useState(1)
  const COL = 4, ROW = 2
  const { data, isLoading, isError } = useActions({ page: page, size: COL * ROW })
  return (
    <View style={{ flex: 1 }}>
      <PagedResultBrowser<Action>
        columnCount={COL}
        rowCount={ROW}
        isLoading={isLoading}
        itemDetailFn={(item) => (
          <View>
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
            padding: 5
            // backgroundColor: '#f00',
          }}>
            <Text style={{
              aspectRatio: 1,
              textAlign: 'center',
              textAlignVertical: 'center',
              borderRadius: 999,
              borderWidth: 1,
              flex: 2,
              // backgroundColor: '#0f0',
            }}>{item.icon}</Text>
            <Text
              numberOfLines={2}
              style={{
                textAlign: 'center',
                textAlignVertical: 'center',
                fontSize: item.name.length >= 10 ? 10 : 12,
                flex: 1,
                // backgroundColor: '#00f',
              }}>
              {item.name}
            </Text>
          </View>
        )}
        onPageChange={(page) => setPage(page)}
      />
    </View>
  )
}