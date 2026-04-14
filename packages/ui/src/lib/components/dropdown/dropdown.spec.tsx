import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dropdown } from './dropdown';

const mockItems = [
  { label: 'Edit', value: 'edit' },
  { label: 'Delete', value: 'delete', disabled: true },
];

describe('Dropdown Component', () => {
  const defaultProps = {
    items: mockItems,
    trigger: 'Open Menu',
    onSelect: vi.fn(),
  };

  it('renders the trigger element correctly', () => {
    render(<Dropdown {...defaultProps} />);
    // Check if the element exists in the DOM
    expect(screen.getByRole('button', { name: /open menu/i })).toBeDefined();
  });

  it('opens the menu and displays items when clicked', async () => {
    render(<Dropdown {...defaultProps} />);
    
    const trigger = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(trigger);

    await waitFor(() => {
      // Use queryByText and check that it is not null
      expect(screen.queryByText('Edit')).not.toBeNull();
    });
  });

  it('renders as disabled when the disabled prop is true', () => {
    render(<Dropdown {...defaultProps} disabled={true} />);
    
    const trigger = screen.getByRole('button', { name: /open menu/i }) as HTMLButtonElement;
    // Check the native DOM property
    expect(trigger.disabled).toBe(true);
  });

  it('applies custom class names to the trigger', () => {
    const customClass = 'custom-trigger-style';
    render(<Dropdown {...defaultProps} triggerClassName={customClass} />);
    
    const trigger = screen.getByRole('button', { name: /open menu/i });
    // Check the classList directly
    expect(trigger.classList.contains(customClass)).toBe(true);
  });
});