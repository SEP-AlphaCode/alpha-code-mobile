import PagedResultBrowser from '@/components/paged-result-browser/paged-result-browser'
import { useExpressions } from '@/features/actions/hooks/useAction'
import { Expression } from '@/features/actions/types/actions'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

export default function ExpressionsPage() {
    const [page, setPage] = useState(1)
    const COL = 4, ROW = 2
    const { data, isLoading, isError } = useExpressions({ page: page, size: COL * ROW })
    return (
        <View style={{ flex: 1 }}>
            <PagedResultBrowser<Expression>
                columnCount={COL}
                rowCount={ROW}
                isLoading={isLoading}
                itemDetailFn={(item) => (
                    <View>
                        <Text>{isError ? 'E' : '...'}</Text>
                        <Text>{item.imageUrl}</Text>
                        <Text>{item.name}</Text>
                    </View>
                )}
                data={data}
                listItemFn={(item, id, isSelected) => (
                    <View>
                        <Text>{item.name}</Text>
                    </View>
                )}
                onPageChange={(page) => setPage(page)}
            />
        </View>
    )
}