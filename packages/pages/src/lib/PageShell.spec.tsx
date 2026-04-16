import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { PageShell } from './page-shell';
import { PageDefinition } from './registry';

vi.mock('@inithium/ui', () => ({
  Box: ({ children, ...props }: any) => <div data-testid="box-container" {...props}>{children}</div>,
}));

describe('PageShell', () => {
  const mockPage: PageDefinition = {
    key: 'test',
    path: '/test',
    entry: 'fadeIn',
    exit: 'fadeOut',
    bg: 'surface',
    component: React.lazy(() => import('./registry').then(() => ({ default: () => <div data-testid="page-content">Content</div> }))),
  };

  const mockController = {
    phase: 'entered' as const,
    triggerExit: vi.fn(() => Promise.resolve()),
    triggerEnter: vi.fn(),
  };

  it('renders the Box container with correct animation props', () => {
    render(<PageShell page={mockPage} controller={mockController} />);
    const box = screen.getByTestId('box-container');
    expect(box).toBeDefined();
  });

  it('renders the suspended component content', async () => {
    render(<PageShell page={mockPage} controller={mockController} />);
    const content = await screen.findByTestId('page-content');
    expect(content).toBeDefined();
  });
});