import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VirtualList, VirtualGrid } from '../VirtualList';

// Mock @tanstack/react-virtual
const mockGetVirtualItems = vi.fn();
const mockGetTotalSize = vi.fn();
const mockMeasureElement = vi.fn();
const mockMeasure = vi.fn();

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: any) => {
    // Generate virtual items based on count and estimateSize
    const count = options.count;
    const estimateSize = options.estimateSize;
    const items = [];
    let offset = 0;
    for (let i = 0; i < count; i++) {
      const size = typeof estimateSize === 'function' ? estimateSize(i) : 50;
      items.push({
        index: i,
        key: i,
        start: offset,
        size,
        end: offset + size,
      });
      offset += size + (options.gap || 0);
    }
    mockGetVirtualItems.mockReturnValue(items);
    mockGetTotalSize.mockReturnValue(offset);

    return {
      getVirtualItems: mockGetVirtualItems,
      getTotalSize: mockGetTotalSize,
      measureElement: mockMeasureElement,
      measure: mockMeasure,
    };
  },
}));

describe('VirtualList', () => {
  const defaultItems = Array.from({ length: 10 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));

  const renderItem = (item: { id: string; name: string }, index: number) => (
    <div data-testid={`item-${index}`}>{item.name}</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders items using renderItem function', () => {
    render(
      <VirtualList
        items={defaultItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    // All 10 items should be rendered (virtualizer mock renders all)
    for (let i = 0; i < 10; i++) {
      expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
      expect(screen.getByText(`Item ${i}`)).toBeInTheDocument();
    }
  });

  it('renders empty state when items array is empty', () => {
    render(
      <VirtualList
        items={[]}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        emptyState={<div data-testid="empty">No items</div>}
      />
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText('No items')).toBeInTheDocument();
  });

  it('does not render empty state when items exist', () => {
    render(
      <VirtualList
        items={defaultItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        emptyState={<div data-testid="empty">No items</div>}
      />
    );

    expect(screen.queryByTestId('empty')).not.toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <VirtualList
        items={defaultItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        isLoading={true}
        loadingState={<div data-testid="loading">Loading...</div>}
      />
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not render loading state when isLoading is false', () => {
    render(
      <VirtualList
        items={defaultItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        isLoading={false}
        loadingState={<div data-testid="loading">Loading...</div>}
      />
    );

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('does not render empty state when isLoading is true even if items are empty', () => {
    render(
      <VirtualList
        items={[]}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        isLoading={true}
        emptyState={<div data-testid="empty">No items</div>}
      />
    );

    expect(screen.queryByTestId('empty')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <VirtualList
        items={defaultItems}
        height={400}
        itemHeight={50}
        renderItem={renderItem}
        className="my-custom-class"
      />
    );

    const listEl = container.querySelector('.virtual-list');
    expect(listEl).toHaveClass('my-custom-class');
  });

  it('sets correct container height style', () => {
    const { container } = render(
      <VirtualList
        items={defaultItems}
        height={600}
        itemHeight={50}
        renderItem={renderItem}
      />
    );

    const listEl = container.querySelector('.virtual-list') as HTMLElement;
    expect(listEl.style.height).toBe('600px');
    expect(listEl.style.overflow).toBe('auto');
  });
});

describe('VirtualGrid', () => {
  const gridItems = Array.from({ length: 12 }, (_, i) => ({
    id: `grid-${i}`,
    label: `Grid Item ${i}`,
  }));

  const renderGridItem = (
    item: { id: string; label: string },
    index: number
  ) => <div data-testid={`grid-item-${index}`}>{item.label}</div>;

  it('renders grid items', () => {
    render(
      <VirtualGrid
        items={gridItems}
        height={400}
        columnCount={3}
        rowHeight={100}
        renderItem={renderGridItem}
      />
    );

    // The grid should render items
    expect(screen.getByText('Grid Item 0')).toBeInTheDocument();
    expect(screen.getByText('Grid Item 11')).toBeInTheDocument();
  });

  it('applies custom className to grid container', () => {
    const { container } = render(
      <VirtualGrid
        items={gridItems}
        height={400}
        columnCount={3}
        rowHeight={100}
        renderItem={renderGridItem}
        className="my-grid"
      />
    );

    const gridEl = container.querySelector('.virtual-grid');
    expect(gridEl).toHaveClass('my-grid');
  });

  it('sets correct grid template columns', () => {
    const { container } = render(
      <VirtualGrid
        items={gridItems}
        height={400}
        columnCount={4}
        rowHeight={100}
        renderItem={renderGridItem}
      />
    );

    const gridRow = container.querySelector('.grid') as HTMLElement;
    expect(gridRow).toBeTruthy();
    expect(gridRow.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
  });
});
