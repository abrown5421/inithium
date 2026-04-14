import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders when open is true', () => {
    act(() => {
      render(
        <Dialog open={true} onClose={vi.fn()}>
          <div>Content</div>
        </Dialog>
      );
    });

    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('does not render content when open is false', () => {
    act(() => {
      render(
        <Dialog open={false} onClose={vi.fn()}>
          <div>Hidden Content</div>
        </Dialog>
      );
    });

    expect(screen.queryByText('Hidden Content')).toBeNull();
  });

  it('renders title when provided', () => {
    act(() => {
      render(
        <Dialog open={true} onClose={vi.fn()} title="Test Title">
          <div />
        </Dialog>
      );
    });

    expect(screen.getByText('Test Title')).toBeTruthy();
  });

  it('renders description when provided', () => {
    act(() => {
      render(
        <Dialog open={true} onClose={vi.fn()} description="Test Description">
          <div />
        </Dialog>
      );
    });

    expect(screen.getByText('Test Description')).toBeTruthy();
  });

  it('calls onClose when escape key is pressed', () => {
    const onClose = vi.fn();

    act(() => {
      render(
        <Dialog open={true} onClose={onClose}>
          <div>Content</div>
        </Dialog>
      );
    });

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('applies size class correctly', () => {
    act(() => {
      render(
        <Dialog
          open={true}
          onClose={vi.fn()}
          size="lg"
          panelClassName="test-panel"
        >
          <div>Content</div>
        </Dialog>
      );
    });

    const panel = document.querySelector('.test-panel');
    expect(panel).toBeTruthy();
    expect(panel!.className.includes('max-w-lg')).toBe(true);
  });

  it('renders children correctly', () => {
    act(() => {
      render(
        <Dialog open={true} onClose={vi.fn()}>
          <button>Click Me</button>
        </Dialog>
      );
    });

    expect(screen.getByRole('button', { name: /click me/i })).toBeTruthy();
  });

  it('applies custom class names', () => {
    act(() => {
      render(
        <Dialog
          open={true}
          onClose={vi.fn()}
          className="custom-root"
          panelClassName="custom-panel"
        >
          <div>Content</div>
        </Dialog>
      );
    });

    const root = document.querySelector('.custom-root');
    const panel = document.querySelector('.custom-panel');

    expect(root).toBeTruthy();
    expect(panel).toBeTruthy();
  });
});
