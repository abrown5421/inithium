import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Tabs } from './Tabs';

const mockTabs = [
  { label: 'Tab 1', panel: <div>Panel 1</div> },
  { label: 'Tab 2', panel: <div>Panel 2</div> },
  { label: 'Tab 3', panel: <div>Panel 3</div>, disabled: true },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    act(() => {
      render(<Tabs tabs={mockTabs} />);
    });

    expect(screen.getByText('Tab 1')).toBeTruthy();
    expect(screen.getByText('Tab 2')).toBeTruthy();
    expect(screen.getByText('Tab 3')).toBeTruthy();
  });

  it('renders default tab panel', () => {
    act(() => {
      render(<Tabs tabs={mockTabs} defaultIndex={0} />);
    });

    expect(screen.getByText('Panel 1')).toBeTruthy();
  });

  it('changes panel when a tab is clicked', () => {
    act(() => {
      render(<Tabs tabs={mockTabs} />);
    });

    const tab2 = screen.getByText('Tab 2');

    act(() => {
      fireEvent.click(tab2);
    });

    expect(screen.getByText('Panel 2')).toBeTruthy();
  });

  it('does not activate disabled tab', () => {
    act(() => {
      render(<Tabs tabs={mockTabs} />);
    });

    const disabledTab = screen.getByText('Tab 3');

    act(() => {
      fireEvent.click(disabledTab);
    });

    // Should still be on default tab
    expect(screen.getByText('Panel 1')).toBeTruthy();
  });

  it('calls onChange when tab changes', () => {
    const onChange = vi.fn();

    act(() => {
      render(<Tabs tabs={mockTabs} onChange={onChange} />);
    });

    const tab2 = screen.getByText('Tab 2');

    act(() => {
      fireEvent.click(tab2);
    });

    expect(onChange).toHaveBeenCalled();
  });

  it('applies vertical layout when vertical is true', () => {
    act(() => {
      render(<Tabs tabs={mockTabs} vertical={true} className="test-root" />);
    });

    const root = document.querySelector('.test-root');
    expect(root).toBeTruthy();

    expect(root!.className.includes('flex')).toBe(true);
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Tabs
          tabs={mockTabs}
          className="custom-root"
          listClassName="custom-list"
          tabClassName="custom-tab"
          panelClassName="custom-panel"
        />
      );
    });

    const root = document.querySelector('.custom-root');
    const list = document.querySelector('.custom-list');
    const tab = document.querySelector('.custom-tab');
    const panel = document.querySelector('.custom-panel');

    expect(root).toBeTruthy();
    expect(list).toBeTruthy();
    expect(tab).toBeTruthy();
    expect(panel).toBeTruthy();
  });

  it('switches between panels correctly', () => {
    act(() => {
        render(<Tabs tabs={mockTabs} />);
    });
    expect(screen.getByText('Panel 1')).toBeTruthy();
    const tab2 = screen.getByText('Tab 2');
    act(() => {
        fireEvent.click(tab2);
    });
    expect(screen.getByText('Panel 2')).toBeTruthy();
    expect(screen.queryByText('Panel 1')).toBeNull();
});
});
