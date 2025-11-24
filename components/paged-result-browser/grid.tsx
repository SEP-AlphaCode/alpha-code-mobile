import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

type Prop<T> = {
    data?: T[], // undefined = loading, [] = loaded with no data, [items] = loaded with data
    rowCount: number,
    columnCount: number,
    itemRender: (item: T, id: string, isSelected: boolean) => ReactNode,
    dim: {
        width: number,
        height: number
    },
    onItemSelected: (item: T) => void,
    isLoading?: boolean
}

export default function ItemGrid<T>({
    columnCount,
    data,
    rowCount,
    dim,
    itemRender,
    onItemSelected,
    isLoading = false
}: Prop<T>) {
    const itemWidth = dim.width / columnCount;
    const itemHeight = dim.height / rowCount;
    const totalItems = rowCount * columnCount;

    // Determine if we're in loading state (data is undefined)
    const showLoading = isLoading && data === undefined;

    return (
        <View style={[styles.container, { width: dim.width, height: dim.height }]}>
            {Array.from({ length: totalItems }).map((_, index) => {
                const item = data?.[index];
                const row = Math.floor(index / columnCount);
                const col = index % columnCount;
                const hasItem = item !== undefined;

                return (
                    <TouchableWithoutFeedback
                        key={index}
                        onPress={() => hasItem && onItemSelected(item)}
                        disabled={!hasItem}
                    >
                        <View
                            style={[
                                styles.item,
                                {
                                    width: itemWidth,
                                    height: itemHeight,
                                    left: col * itemWidth,
                                    top: row * itemHeight,
                                }
                            ]}
                        >
                            {showLoading ? (
                                // Show skeleton only during initial loading with no cached data
                                <View style={styles.skeleton}>
                                    <ActivityIndicator size="small" />
                                </View>
                            ) : hasItem ? (
                                // Show actual item when we have data (could be from cache)
                                itemRender(item, `item-${index}`, false)
                            ) : (
                                // Show empty slot when loaded but no data for this slot
                                <View style={styles.emptySlot} />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    item: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 1
    },
    skeleton: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
        margin: 2,
        aspectRatio: 1,
    },
    emptySlot: {
        flex: 1,
        // You can style empty slots differently or leave them transparent
    },
});