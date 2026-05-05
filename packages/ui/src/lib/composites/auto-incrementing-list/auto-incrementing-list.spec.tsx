import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../components/box/box', () => ({
  Box: ({ flex, shrink, ...props }: any) => <div {...props} />,
}));

vi.mock('../../components/button/button', () => ({
  Button: (props: any) => <button {...props} />,
}));

vi.mock('../../components/icon/icon', () => ({
  Icon: () => <span data-testid="icon" />,
}));

import { AutoIncrementingList } from './auto-incrementing-list';

describe('AutoIncrementingList', () => {
  const renderItem = (index: number) => (
    <div data-testid={`item-${index}`}>Item {index}</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default min count', () => {
    render(<AutoIncrementingList renderItem={renderItem} min={2} />);

    expect(screen.queryByTestId('item-0')).not.toBeNull();
    expect(screen.queryByTestId('item-1')).not.toBeNull();
  });

  it('respects defaultCount over min', () => {
    render(
      <AutoIncrementingList
        renderItem={renderItem}
        min={1}
        defaultCount={3}
      />
    );

    expect(screen.queryByTestId('item-0')).not.toBeNull();
    expect(screen.queryByTestId('item-1')).not.toBeNull();
    expect(screen.queryByTestId('item-2')).not.toBeNull();
  });

  it('adds an item when clicking add', () => {
    const onChange = vi.fn();

    render(
      <AutoIncrementingList
        renderItem={renderItem}
        onChange={onChange}
      />
    );

    const addButton = screen.getByLabelText('Add item');
    fireEvent.click(addButton);

    expect(screen.queryByTestId('item-1')).not.toBeNull();
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('removes an item when clicking remove', () => {
    const onChange = vi.fn();

    render(
      <AutoIncrementingList
        renderItem={renderItem}
        defaultCount={2}
        onChange={onChange}
      />
    );

    const removeButtons = screen.getAllByLabelText('Remove item');

    fireEvent.click(removeButtons[1]); // last item remove

    expect(screen.queryByTestId('item-1')).toBeNull();
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('does not go below min', () => {
    render(
      <AutoIncrementingList
        renderItem={renderItem}
        min={1}
        defaultCount={1}
      />
    );

    const removeButton = screen.getByLabelText('Remove item');

    expect(removeButton).toHaveProperty('disabled', true);
  });

  it('does not exceed max', () => {
    render(
      <AutoIncrementingList
        renderItem={renderItem}
        max={2}
        defaultCount={2}
      />
    );

    const addButton = screen.getByLabelText('Add item');

    expect(addButton).toHaveProperty('disabled', true);
  });

  it('calls onChange correctly for multiple operations', () => {
    const onChange = vi.fn();

    render(
        <AutoIncrementingList
        renderItem={renderItem}
        defaultCount={1}
        onChange={onChange}
        />
    );

    const addButton = screen.getByLabelText('Add item');

    fireEvent.click(addButton);
    fireEvent.click(addButton);

    const removeButtons = screen.getAllByLabelText('Remove item');
    const lastRemoveButton = removeButtons[removeButtons.length - 1];

    fireEvent.click(lastRemoveButton);

    expect(onChange).toHaveBeenNthCalledWith(1, 2);
    expect(onChange).toHaveBeenNthCalledWith(2, 3);
    expect(onChange).toHaveBeenNthCalledWith(3, 2);
  });
});