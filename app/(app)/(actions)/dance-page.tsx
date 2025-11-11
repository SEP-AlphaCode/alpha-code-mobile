import PagedResultBrowser from '@/components/paged-result-browser/paged-result-browser'
import { useDances } from '@/features/actions/hooks/useAction'
import { Dance } from '@/features/actions/types/actions'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

export default function DancesPage() {
    const [page, setPage] = useState(1)
    const COL = 4, ROW = 2
    const { data, isLoading, isError } = useDances({ page: page, size: COL * ROW })

    return (
        <View style={{ flex: 1 }}>
            <PagedResultBrowser<Dance>
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
                        flexDirection: 'column',
                    }}>
                        <Text style={{
                            flex: 1.5,
                            aspectRatio: 1,
                            textAlign: 'center',
                            textAlignVertical: 'center',
                            borderRadius: 999,
                            borderWidth: 1,
                        }}>{item.icon}</Text>
                        <Text style={{
                            textAlign: 'center',
                            flex: 1,
                            fontSize: 12
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