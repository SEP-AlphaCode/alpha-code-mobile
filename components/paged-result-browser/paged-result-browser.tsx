import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SimpleCarousel } from './carousel-drawer';
import { PagedResultBrowserProps } from './props';

export default function PagedResultBrowser<T>({
  columnCount,
  data,
  itemDetailFn,
  listItemFn,
  rowCount,
  isLoading,
  onPageChange,
  onItemSelect,
  queryClient,
  queryKey,
  currentParams
}: PagedResultBrowserProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  const handleItemSelected = (item: T) => {
    onItemSelect(item);
    setSelectedItem(item);
  };

  // Calculate heights
  const drawerHeight = containerDimensions.height * 0.4;
  const detailHeight = containerDimensions.height - drawerHeight;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Upper Part - Detail View */}
      <View style={[styles.detailContainer, { height: detailHeight }]}>
        {selectedItem ? (
          <ScrollView contentContainerStyle={styles.detailContent}>
            {itemDetailFn(selectedItem)}
          </ScrollView>
        ) : (
          <View style={styles.emptyDetail}>
            <Text style={styles.emptyDetailText}>Select an item to view details</Text>
          </View>
        )}
      </View>

      {/* Lower Part - Carousel Drawer */}
      <View style={[styles.drawerContainer, { height: drawerHeight }]}>
        <SimpleCarousel
          columnCount={columnCount}
          data={data}
          itemDetailFn={itemDetailFn}
          listItemFn={listItemFn}
          rowCount={rowCount}
          isLoading={isLoading}
          onPageChange={onPageChange}
          onItemSelect={handleItemSelected}
          queryClient={queryClient}
          queryKey={queryKey}
          currentParams={currentParams}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailContent: {
    padding: 16,
    backgroundColor: '#fafafa',
    flex: 1
  },
  emptyDetail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDetailText: {
    fontSize: 16,
    color: '#999',
  },
  drawerContainer: {
    backgroundColor: '#fff',
  },
});