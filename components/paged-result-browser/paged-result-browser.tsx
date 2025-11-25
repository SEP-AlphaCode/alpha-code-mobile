import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import ItemGrid from './grid';
import { PagedResultBrowserProps } from './props';

export default function PagedResultBrowser<T>({
  columnCount,
  allPagesData,
  itemDetailFn,
  listItemFn,
  rowCount,
  isLoading,
  onPageChange,
  onItemSelect,
  totalPages
}: PagedResultBrowserProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  const handleItemSelected = (item: T) => {
    onItemSelect(item);
    setSelectedItem(item);
  };

  const checkIfSelected = (item: T): boolean => {
    return selectedItem === item;
  };

  const wrappedListItemFn = (item: T, id: string, isSelected: boolean) => {
    return listItemFn(item, id, checkIfSelected(item));
  };

  // Calculate dimensions
  const drawerHeight = containerDimensions.height * 0.4;
  const detailHeight = containerDimensions.height - drawerHeight;
  const gridHeight = drawerHeight - 20;

  // Generate carousel data with actual page numbers
  const carouselData = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleCarouselChange = (index: number) => {
    const newPage = index + 1;
    setCurrentIndex(index);
    if (newPage !== (allPagesData?.[newPage]?.page || newPage)) {
      onPageChange(newPage);
    }
  };

  // Render each page in the carousel with its actual data
  const renderCarouselItem = ({ index }: { index: number }) => {
    const pageNumber = index + 1;
    const pageData = allPagesData?.[pageNumber];

    return (
      <View style={styles.carouselItem}>
        <ItemGrid
          data={isLoading ? undefined : pageData?.data}
          rowCount={rowCount}
          columnCount={columnCount}
          itemRender={wrappedListItemFn}
          dim={{ width: containerDimensions.width, height: gridHeight }}
          onItemSelected={handleItemSelected}
        />
      </View>
    );
  };

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

      {/* Lower Part - Drawer with Carousel */}
      <View style={[styles.drawerContainer, { height: drawerHeight }]}>
        {/* Carousel for pages */}
        {containerDimensions.width > 0 && totalPages > 0 && (
          <Carousel
            loop={false}
            width={containerDimensions.width}
            height={gridHeight}
            data={carouselData}
            scrollAnimationDuration={300}
            onSnapToItem={handleCarouselChange}
            defaultIndex={currentIndex}
            renderItem={renderCarouselItem}
          />
        )}

        {/* Page indicator */}
        <View style={styles.pageIndicator}>
          <Text style={styles.pageIndicatorText}>
            Page {currentIndex + 1} of {totalPages}
          </Text>
        </View>
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
    elevation: 50,
    shadowColor: '#000'
  },
  carouselItem: {
    flex: 1,
  },
  pageIndicator: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  pageIndicatorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});