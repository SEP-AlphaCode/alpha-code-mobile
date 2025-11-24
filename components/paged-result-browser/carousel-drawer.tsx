// components/paged-result-browser/simple-carousel.tsx
import { PagedResult } from '@/types/page-result';
import { QueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';
import ItemGrid from './grid';
import { PagedResultBrowserProps } from './props';

const { width: screenWidth } = Dimensions.get('window');

type SimpleCarouselProps<T> = PagedResultBrowserProps<T> & {
  queryClient: QueryClient;
  queryKey: string;
  currentParams: { page: number; size: number; robotModelId?: string };
};

export function SimpleCarousel<T>({
  columnCount,
  data,
  listItemFn,
  rowCount,
  isLoading,
  onPageChange,
  onItemSelect,
  queryClient,
  queryKey,
  currentParams
}: SimpleCarouselProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const translateX = useRef(new Animated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(data?.page || 1);

  // Get cached page data
  const getCachedPageData = (page: number): PagedResult<T> | undefined => {
    try {
      return queryClient.getQueryData([queryKey, { ...currentParams, page }]) as PagedResult<T>;
    } catch {
      return undefined;
    }
  };

  const handleItemSelected = (item: T) => {
    onItemSelect(item);
    setSelectedItem(item);
  };

  const wrappedListItemFn = (item: T, id: string, isSelected: boolean) => {
    return listItemFn(item, id, selectedItem === item);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        const swipeThreshold = screenWidth * 0.25;

        if (dx < -swipeThreshold && data?.has_next) {
          // Swipe left - next page
          goToPage(currentPage + 1);
        } else if (dx > swipeThreshold && data?.has_previous) {
          // Swipe right - previous page
          goToPage(currentPage - 1);
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const goToPage = (page: number) => {
    Animated.timing(translateX, {
      toValue: page > currentPage ? -screenWidth : screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      setCurrentPage(page);
      onPageChange(page);
    });
  };

  const renderPage = (page: number) => {
    const pageData = page === data?.page ? data : getCachedPageData(page);
    const isCurrentPage = page === currentPage;

    return (
      <View key={page} style={[styles.page, !isCurrentPage && styles.hiddenPage]}>
        <ItemGrid
          data={pageData?.data}
          rowCount={rowCount}
          columnCount={columnCount}
          itemRender={wrappedListItemFn}
          dim={{ width: screenWidth, height: 200 }}
          onItemSelected={handleItemSelected}
          isLoading={isLoading && page === data?.page}
        />
      </View>
    );
  };

  if (!data) return null;

  // Show current, previous, and next pages
  const pagesToShow = [];
  if (data.has_previous) pagesToShow.push(currentPage - 1);
  pagesToShow.push(currentPage);
  if (data.has_next) pagesToShow.push(currentPage + 1);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.carousel,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {pagesToShow.map(renderPage)}
      </Animated.View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {Array.from({ length: data.total_pages }, (_, i) => i + 1).map(page => (
          <View
            key={page}
            style={[
              styles.dot,
              page === currentPage && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carousel: {
    flex: 1,
    flexDirection: 'row',
  },
  page: {
    width: screenWidth,
    flex: 1,
  },
  hiddenPage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: screenWidth,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
});