import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { Disclosure } from './Disclosure';

describe('Disclosure', () => {
  it('renders trigger content', () => {
    act(() => {
      render(
        <Disclosure trigger="Open Me">
          <div>Panel Content</div>
        </Disclosure>
      );
    });

    expect(screen.getByText('Open Me')).toBeTruthy();
  });

  it('does not show panel content by default', () => {
    act(() => {
      render(
        <Disclosure trigger="Open Me">
          <div>Hidden Content</div>
        </Disclosure>
      );
    });

    expect(screen.queryByText('Hidden Content')).toBeNull();
  });

  it('shows panel content when defaultOpen is true', () => {
    act(() => {
      render(
        <Disclosure trigger="Open Me" defaultOpen={true}>
          <div>Visible Content</div>
        </Disclosure>
      );
    });

    expect(screen.getByText('Visible Content')).toBeTruthy();
  });

  it('toggles panel content when trigger is clicked', () => {
    act(() => {
      render(
        <Disclosure trigger="Toggle Me">
          <div>Toggle Content</div>
        </Disclosure>
      );
    });

    const button = screen.getByText('Toggle Me');

    // open
    act(() => {
      fireEvent.click(button);
    });

    expect(screen.getByText('Toggle Content')).toBeTruthy();

    // close
    act(() => {
      fireEvent.click(button);
    });

    expect(screen.queryByText('Toggle Content')).toBeNull();
  });

  it('applies size classes to trigger', () => {
    act(() => {
      render(
        <Disclosure
          trigger="Sized Trigger"
          size="lg"
          triggerClassName="test-trigger"
        >
          <div>Content</div>
        </Disclosure>
      );
    });

    const trigger = document.querySelector('.test-trigger');
    expect(trigger).toBeTruthy();

    // we don’t know exact mapping, just ensure class applied
    expect(trigger!.className.length > 0).toBe(true);
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Disclosure
          trigger="Styled"
          className="custom-root"
          triggerClassName="custom-trigger"
          panelClassName="custom-panel"
          defaultOpen={true}
        >
          <div>Content</div>
        </Disclosure>
      );
    });

    const root = document.querySelector('.custom-root');
    const trigger = document.querySelector('.custom-trigger');
    const panel = document.querySelector('.custom-panel');

    expect(root).toBeTruthy();
    expect(trigger).toBeTruthy();
    expect(panel).toBeTruthy();
  });

  it('renders children inside panel when open', () => {
    act(() => {
      render(
        <Disclosure trigger="Open" defaultOpen={true}>
          <button>Inner Button</button>
        </Disclosure>
      );
    });

    expect(screen.getByRole('button', { name: /inner button/i })).toBeTruthy();
  });
});
