"use client"
import type { PagedResult } from "@/types/page-result"
import type React from "react"
import { useRef, useState } from "react"
import { type LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"
import ItemGrid from "./grid"

const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
  if (totalPages <= 10) {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <TouchableOpacity key={page} onPress={() => onPageChange(page)} disabled={page === currentPage}>
        <Text style={[styles.pageNumber, page === currentPage && styles.currentPage]}>{page}</Text>
      </TouchableOpacity>
    ))
  }

  const pages: (number | string)[] = []
  pages.push(1, 2, 3)
  if (currentPage > 4) pages.push("...")
  if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage)
  if (currentPage < totalPages - 3) pages.push("...")
  pages.push(totalPages - 2, totalPages - 1, totalPages)

  return pages.map((page, index) => {
    if (page === "...") {
      return (
        <Text key={`ellipsis-${index}`} style={[styles.pageNumber, styles.ellipsis]}>
          {page}
        </Text>
      )
    }
    return (
      <TouchableOpacity
        key={page as number}
        onPress={() => onPageChange(page as number)}
        disabled={page === currentPage}
      >
        <Text style={[styles.pageNumber, page === currentPage && styles.currentPage]}>{page}</Text>
      </TouchableOpacity>
    )
  })
}

type PagedResultBrowserProps<T> = {
  columnCount: number
  rowCount: number
  isLoading: boolean
  isLoadingAdjacent?: boolean
  data?: PagedResult<T>
  adjacentPages?: {
    previous?: PagedResult<T>
    next?: PagedResult<T>
  }
  itemDetailFn: (item: T) => React.ReactNode
  listItemFn: (item: T, id: string, isSelected: boolean) => React.ReactNode
  onPageChange: (page: number) => void
  onItemSelect: (item: T) => void
}

export default function PagedResultBrowser<T>({
  columnCount,
  rowCount,
  isLoading,
  isLoadingAdjacent,
  data,
  adjacentPages,
  itemDetailFn,
  listItemFn,
  onPageChange,
  onItemSelect,
}: PagedResultBrowserProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const scrollViewRef = useRef<Animated.ScrollView>(null)
  const scrollPosition = useSharedValue(0)

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setContainerDimensions({ width, height })

    const initialPage = adjacentPages?.previous ? width : 0
    scrollPosition.value = initialPage
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: initialPage,
        animated: false,
      })
    }, 0)
  }

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollPosition.value = event.contentOffset.x
    },
  })

  const handleItemSelected = (item: T) => {
    onItemSelect(item)
    setSelectedItem(item)
  }

  useAnimatedReaction(
    () => scrollPosition.value,
    (currentScroll) => {
      if (containerDimensions.width === 0 || !data) return

      const pageWidth = containerDimensions.width
      const detectedPage = Math.round(currentScroll / pageWidth) + (adjacentPages?.previous ? 0 : 1)

      if (detectedPage !== data.page && detectedPage > 0) {
        runOnJS(onPageChange)(detectedPage)
      }
    },
    [containerDimensions.width, data, adjacentPages?.previous],
  )

  const handlePageChange = (page: number) => {
    const offset = (adjacentPages?.previous ? page : page - 1) * containerDimensions.width
    scrollViewRef.current?.scrollTo({ x: offset, animated: true })
    onPageChange(page)
  }

  const drawerHeight = containerDimensions.height * 0.4
  const detailHeight = containerDimensions.height - drawerHeight
  const paginationHeight = 50
  const gridHeight = drawerHeight - paginationHeight

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Upper Part - Detail View */}
      <View style={[styles.detailContainer, { height: detailHeight }]}>
        {selectedItem ? (
          <ScrollView contentContainerStyle={styles.detailContent}>{itemDetailFn(selectedItem)}</ScrollView>
        ) : (
          <View style={styles.emptyDetail}>
            <Text style={styles.emptyDetailText}>Select an item to view details</Text>
          </View>
        )}
      </View>

      {/* Lower Part - Carousel with Grid and Pagination */}
      <View style={[styles.drawerContainer, { height: drawerHeight }]}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          scrollIndicatorInsets={{ right: 1 }}
          style={styles.carousel}
        >
          {/* Previous Page */}
          {adjacentPages?.previous && (
            <View style={[styles.gridPage, { width: containerDimensions.width }]}>
              {containerDimensions.width > 0 && (
                <ItemGrid
                  data={adjacentPages.previous?.data}
                  rowCount={rowCount}
                  columnCount={columnCount}
                  itemRender={(item, id) => listItemFn(item, id, selectedItem === item)}
                  dim={{ width: containerDimensions.width, height: gridHeight }}
                  onItemSelected={handleItemSelected}
                />
              )}
            </View>
          )}

          {/* Current Page */}
          <View style={[styles.gridPage, { width: containerDimensions.width }]}>
            {containerDimensions.width > 0 && (
              <ItemGrid
                data={isLoading ? undefined : data?.data}
                rowCount={rowCount}
                columnCount={columnCount}
                itemRender={(item, id) => listItemFn(item, id, selectedItem === item)}
                dim={{ width: containerDimensions.width, height: gridHeight }}
                onItemSelected={handleItemSelected}
              />
            )}
          </View>

          {/* Next Page */}
          {adjacentPages?.next && (
            <View style={[styles.gridPage, { width: containerDimensions.width }]}>
              {containerDimensions.width > 0 && (
                <ItemGrid
                  data={adjacentPages.next?.data}
                  rowCount={rowCount}
                  columnCount={columnCount}
                  itemRender={(item, id) => listItemFn(item, id, selectedItem === item)}
                  dim={{ width: containerDimensions.width, height: gridHeight }}
                  onItemSelected={handleItemSelected}
                />
              )}
            </View>
          )}
        </Animated.ScrollView>

        {/* Pagination */}
        <View style={[styles.paginationContainer, { height: paginationHeight }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.paginationContent}
          >
            {data && !isLoading && renderPagination(data.page, data.total_pages, handlePageChange)}
          </ScrollView>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailContent: {
    padding: 16,
    backgroundColor: "#fafafa",
    flex: 1,
  },
  emptyDetail: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyDetailText: {
    fontSize: 16,
    color: "#999",
  },
  drawerContainer: {
    backgroundColor: "#fff",
    elevation: 50,
    shadowColor: "#000",
  },
  carousel: {
    flex: 1,
  },
  gridPage: {
    justifyContent: "center",
    alignItems: "center",
  },
  paginationContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#f9f9f9",
  },
  paginationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    margin: "auto",
  },
  pageNumber: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  currentPage: {
    fontWeight: "bold",
    color: "#000",
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
  },
  ellipsis: {
    color: "#999",
  },
})
