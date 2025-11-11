import { useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ItemGrid from './grid';
import { PagedResultBrowserProps } from './props';

const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
  if (totalPages <= 10) {
    // Show all pages if 10 or fewer
    return Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
      <TouchableOpacity
        key={page}
        onPress={() => onPageChange(page)}
        disabled={page === currentPage}
      >
        <Text
          style={[
            styles.pageNumber,
            page === currentPage && styles.currentPage
          ]}
        >
          {page}
        </Text>
      </TouchableOpacity>
    ));
  }

  // For more than 10 pages, show first 3, last 3, and current page with ellipsis
  const pages: (number | string)[] = [];

  // First 3 pages
  pages.push(1, 2, 3);

  // Add ellipsis if current page is beyond first 4 pages
  if (currentPage > 4) {
    pages.push('...');
  }

  // Add current page if it's not in first 3 or last 3
  if (currentPage > 3 && currentPage < totalPages - 2) {
    pages.push(currentPage);
  }

  // Add ellipsis if current page is before last 4 pages
  if (currentPage < totalPages - 3) {
    pages.push('...');
  }

  // Last 3 pages
  pages.push(totalPages - 2, totalPages - 1, totalPages);

  return pages.map((page, index) => {
    if (page === '...') {
      return (
        <Text
          key={`ellipsis-${index}`}
          style={[styles.pageNumber, styles.ellipsis]}
        >
          {page}
        </Text>
      );
    }

    return (
      <TouchableOpacity
        key={page as number}
        onPress={() => onPageChange(page as number)}
        disabled={page === currentPage}
      >
        <Text
          style={[
            styles.pageNumber,
            page === currentPage && styles.currentPage
          ]}
        >
          {page}
        </Text>
      </TouchableOpacity>
    );
  });
};

export default function PagedResultBrowser<T>({
  columnCount,
  data,
  itemDetailFn,
  listItemFn,
  rowCount,
  isLoading,
  onPageChange
}: PagedResultBrowserProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -50 && data?.has_next) {
        onPageChange(data.page + 1);
      } else if (gestureState.dx > 50 && data?.has_previous) {
        onPageChange(data.page - 1);
      }
    },
  });

  const handleItemSelected = (item: T) => {
    setSelectedItem(item);
  };

  // Calculate grid dimensions (adjust ratio as needed)
  const gridHeight = containerDimensions.height * 0.35;
  const gridWidth = containerDimensions.width;

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
    >
      {/* Upper part - Item Detail */}
      <View style={styles.detailSection}>
        {selectedItem ? itemDetailFn(selectedItem) : (
          <View style={styles.placeholder}>
            <Text>Select an item to view details</Text>
          </View>
        )}
      </View>

      {/* Lower part - Grid Drawer */}
      <View
        style={styles.gridSection}
        {...panResponder.panHandlers}
      >
        <ItemGrid
          data={isLoading ? undefined : data?.data}
          rowCount={rowCount}
          columnCount={columnCount}
          itemRender={listItemFn}
          onItemSelected={isLoading ? () => { } : handleItemSelected}
          dim={{ width: gridWidth, height: gridHeight }}
        />

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <View style={styles.paginationContainer}>
            {renderPagination(data.page, data.total_pages, onPageChange)}
          </View>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    // height: '100%',
    flex: 1
  },
  detailSection: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  gridSection: {
    paddingVertical: 10,
    borderColor: '#f00',
    // borderWidth: 1
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    gap: 8,
  },
  pageNumber: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentPage: {
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  ellipsis: {
    color: '#999',
  },
});