import React, { useRef, useCallback, memo, ReactNode } from 'react';
import { useVirtualizer, VirtualizerOptions } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight?: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
  gap?: number;
  horizontal?: boolean;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  isLoading?: boolean;
}

/**
 * High-performance Virtual List component for rendering large lists
 */
export function VirtualList<T>({
  items,
  height,
  itemHeight = 50,
  renderItem,
  overscan = 5,
  className = '',
  gap = 0,
  horizontal = false,
  onEndReached,
  endReachedThreshold = 0.8,
  emptyState,
  loadingState,
  isLoading = false,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(
      (index: number) => {
        if (typeof itemHeight === 'function') {
          return itemHeight(index);
        }
        return itemHeight;
      },
      [itemHeight]
    ),
    overscan,
    horizontal,
    gap,
  } as VirtualizerOptions<HTMLDivElement, Element>);

  const virtualItems = virtualizer.getVirtualItems();

  // Handle end reached callback
  React.useEffect(() => {
    if (!onEndReached || !parentRef.current) return;

    const scrollElement = parentRef.current;
    const handleScroll = () => {
      const scrollPercentage = horizontal
        ? scrollElement.scrollLeft /
          (scrollElement.scrollWidth - scrollElement.clientWidth)
        : scrollElement.scrollTop /
          (scrollElement.scrollHeight - scrollElement.clientHeight);

      if (scrollPercentage >= endReachedThreshold && !isLoading) {
        onEndReached();
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [horizontal, onEndReached, endReachedThreshold, isLoading]);

  // Show empty state if no items
  if (!isLoading && items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const containerStyle = horizontal
    ? { width: `${height}px`, overflow: 'auto' }
    : { height: `${height}px`, overflow: 'auto' };

  const virtualContainerStyle = horizontal
    ? {
        width: `${virtualizer.getTotalSize()}px`,
        height: '100%',
        position: 'relative' as const,
      }
    : {
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative' as const,
      };

  return (
    <div
      ref={parentRef}
      className={`virtual-list ${className}`}
      style={containerStyle}
    >
      <div style={virtualContainerStyle}>
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];
          const style = horizontal
            ? {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: `${virtualItem.size}px`,
                transform: `translateX(${virtualItem.start}px)`,
              }
            : {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              };

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement as React.RefCallback<Element>}
              style={style}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>

      {isLoading && loadingState && (
        <div className="flex justify-center p-4">{loadingState}</div>
      )}
    </div>
  );
}

// Memoized version for better performance
export const VirtualListMemo = memo(VirtualList) as typeof VirtualList;

// Virtual Grid Component
interface VirtualGridProps<T> {
  items: T[];
  height: number;
  columnCount: number;
  rowHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => ReactNode;
  gap?: number;
  className?: string;
  overscan?: number;
}

export function VirtualGrid<T>({
  items,
  height,
  columnCount,
  rowHeight,
  renderItem,
  gap = 0,
  className = '',
  overscan = 5,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(items.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(
      (index: number) => {
        if (typeof rowHeight === 'function') {
          return rowHeight(index);
        }
        return rowHeight;
      },
      [rowHeight]
    ),
    overscan,
    gap,
  } as VirtualizerOptions<HTMLDivElement, Element>);

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`virtual-grid ${className}`}
      style={{ height: `${height}px`, overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const endIndex = Math.min(startIndex + columnCount, items.length);
          const rowItems = items.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement as React.RefCallback<Element>}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  gap: `${gap}px`,
                }}
              >
                {rowItems.map((item, index) => (
                  <div key={startIndex + index}>
                    {renderItem(item, startIndex + index)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualGridMemo = memo(VirtualGrid) as typeof VirtualGrid;

// Dynamic Virtual List with variable item heights
interface DynamicVirtualListProps<T> {
  items: T[];
  height: number;
  renderItem: (item: T, index: number) => ReactNode;
  estimatedItemHeight?: number;
  className?: string;
  gap?: number;
  overscan?: number;
}

export function DynamicVirtualList<T>({
  items,
  height,
  renderItem,
  estimatedItemHeight = 100,
  className = '',
  gap = 0,
  overscan = 5,
}: DynamicVirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const itemHeights = useRef<Map<number, number>>(new Map());

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(
      (index: number) => {
        return itemHeights.current.get(index) || estimatedItemHeight;
      },
      [estimatedItemHeight]
    ),
    overscan,
    gap,
  } as VirtualizerOptions<HTMLDivElement, Element>);

  // Measure element callback
  const measureElement = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;

      const index = parseInt(element.getAttribute('data-index') || '0', 10);
      const height = element.getBoundingClientRect().height;

      if (itemHeights.current.get(index) !== height) {
        itemHeights.current.set(index, height);
        virtualizer.measure();
      }
    },
    [virtualizer]
  );

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`dynamic-virtual-list ${className}`}
      style={{ height: `${height}px`, overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={measureElement as React.RefCallback<Element>}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const DynamicVirtualListMemo = memo(
  DynamicVirtualList
) as typeof DynamicVirtualList;

// Example usage component
interface ListItem {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export const VirtualListExample: React.FC = () => {
  const [items] = React.useState<ListItem[]>(() =>
    Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      title: `Item ${i + 1}`,
      description: `Description for item ${i + 1}`,
      image: `https://via.placeholder.com/150?text=Item+${i + 1}`,
    }))
  );

  const renderItem = useCallback(
    (item: ListItem) => (
      <div className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50">
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="w-12 h-12 rounded-lg mr-4"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-500">{item.description}</p>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Virtual List Example (10,000 items)
      </h2>
      <VirtualList
        items={items}
        height={600}
        itemHeight={76}
        renderItem={renderItem}
        className="border border-gray-300 rounded-lg"
        gap={0}
        emptyState={<p>No items to display</p>}
      />
    </div>
  );
};

export default {
  VirtualList: VirtualListMemo,
  VirtualGrid: VirtualGridMemo,
  DynamicVirtualList: DynamicVirtualListMemo,
};
