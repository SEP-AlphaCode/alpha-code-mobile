// components/paged-result-browser/enhanced-paged-result-browser.tsx
import { PagedResult } from '@/types/page-result';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import ItemGrid from './grid';

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

type PagedResultBrowserProps<T> = {
  columnCount: number;
  rowCount: number;
  isLoading: boolean;
  isLoadingAdjacent?: boolean;
  data?: PagedResult<T>;
  adjacentPages?: {
    previous?: PagedResult<T>;
    next?: PagedResult<T>;
  };
  itemDetailFn: (item: T) => React.ReactNode;
  listItemFn: (item: T, id: string, isSelected: boolean) => React.ReactNode;
  onPageChange: (page: number) => void;
  onItemSelect: (item: T) => void;
};

export default function PagedResultBrowser<T>({
  columnCount,
  data,
  adjacentPages,
  itemDetailFn,
  listItemFn,
  rowCount,
  isLoading,
  isLoadingAdjacent,
  onPageChange,
  onItemSelect
}: PagedResultBrowserProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [currentView, setCurrentView] = useState<'current' | 'previous' | 'next'>('current');

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

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

  // Get data for current view
  const getCurrentData = () => {
    switch (currentView) {
      case 'previous':
        return adjacentPages?.previous;
      case 'next':
        return adjacentPages?.next;
      default:
        return data;
    }
  };

  const triggerPageChange = (direction: 'next' | 'prev') => {
    if (!data) return;

    if (direction === 'next' && data.has_next) {
      // If we have next page data preloaded, show it immediately
      if (adjacentPages?.next) {
        setCurrentView('next');
        translateX.value = -containerDimensions.width;
        opacity.value = 0;

        // Animate to center
        translateX.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });

        // Update page after animation
        setTimeout(() => {
          onPageChange(data.page + 1);
          setCurrentView('current');
        }, 300);
      } else {
        onPageChange(data.page + 1);
      }
    } else if (direction === 'prev' && data.has_previous) {
      // If we have previous page data preloaded, show it immediately
      if (adjacentPages?.previous) {
        setCurrentView('previous');
        translateX.value = containerDimensions.width;
        opacity.value = 0;

        // Animate to center
        translateX.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });

        // Update page after animation
        setTimeout(() => {
          onPageChange(data.page - 1);
          setCurrentView('current');
        }, 300);
      } else {
        onPageChange(data.page - 1);
      }
    }
  };

  // Pan gesture for swiping
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (isLoading || isLoadingAdjacent) return;

      translateX.value = event.translationX;

      // Reduce opacity as user swipes
      const dragProgress = Math.abs(event.translationX) / containerDimensions.width;
      opacity.value = Math.max(0.3, 1 - dragProgress);
    })
    .onEnd((event) => {
      if (isLoading || isLoadingAdjacent) return;

      const threshold = containerDimensions.width * 0.25;
      const velocity = event.velocityX;
      const shouldChangePage = Math.abs(translateX.value) > threshold || Math.abs(velocity) > 500;

      // Swipe left (next page)
      if (translateX.value < -threshold || velocity < -500) {
        if (data?.has_next && shouldChangePage) {
          runOnJS(triggerPageChange)('next');
          return;
        }
      }
      // Swipe right (previous page)
      else if (translateX.value > threshold || velocity > 500) {
        if (data?.has_previous && shouldChangePage) {
          runOnJS(triggerPageChange)('prev');
          return;
        }
      }

      // Reset position if threshold not met
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
      opacity.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  // Reset position when data changes
  useEffect(() => {
    if (!isLoading && !isLoadingAdjacent) {
      translateX.value = 0;
      opacity.value = 1;
    }
  }, [data?.page, isLoading, isLoadingAdjacent]);

  const currentData = getCurrentData();
  const drawerHeight = containerDimensions.height * 0.4;
  const detailHeight = containerDimensions.height - drawerHeight;
  const paginationHeight = 50;
  const gridHeight = drawerHeight - paginationHeight;

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

      {/* Lower Part - Drawer with Grid and Pagination */}
      <View style={[styles.drawerContainer, { height: drawerHeight }]}>
        {/* Grid with Gesture Support */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.gridContainer, animatedStyle]}>
            {containerDimensions.width > 0 && (
              <ItemGrid
                data={isLoading ? undefined : currentData?.data}
                rowCount={rowCount}
                columnCount={columnCount}
                itemRender={wrappedListItemFn}
                dim={{ width: containerDimensions.width, height: gridHeight }}
                onItemSelected={handleItemSelected}
              />
            )}
          </Animated.View>
        </GestureDetector>

        {/* Pagination */}
        <View style={[styles.paginationContainer, { height: paginationHeight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paginationContent}
          >
            {data && !isLoading && renderPagination(data.page, data.total_pages, onPageChange)}
          </ScrollView>
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
  gridContainer: {
    flex: 1,
  },
  paginationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  paginationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    margin: 'auto'
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