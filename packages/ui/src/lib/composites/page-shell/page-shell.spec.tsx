import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageShell } from './page-shell';
import { PageDefinition } from '@inithium/types';

const boxMock = vi.fn(({ children }) => {
  return <div data-testid="box">{children}</div>;
});

vi.mock('../../components/box/box', () => ({
  Box: (props: any) => boxMock(props),
}));

const DummyPageComponent = () => <div data-testid="page-content">Page Content</div>;

const createPage = (overrides = {}) => ({
  key: 'test-page',
  path: '/test',

  entry: 'fadeIn',
  exit: 'fadeOut',

  centered: false,
  bg: 'surface',
  color: 'surface-contrast',

  component: DummyPageComponent as any,

  ...overrides,
} satisfies PageDefinition);

const controllerMock = {
  play: vi.fn(),
  stop: vi.fn(),
} as any;

describe('PageShell', () => {
  beforeEach(() => {
    boxMock.mockClear();
  });

  it('renders the page component', () => {
    const page = createPage();

    render(<PageShell page={page} controller={controllerMock} />); //here

    const pageEl = screen.queryByTestId('page-content');
    expect(pageEl !== null).toBe(true);
  });

  it('renders footer when provided', () => {
    const page = createPage();

    render(
      <PageShell
        page={page} //here
        controller={controllerMock}
        footer={<div data-testid="footer">Footer</div>}
      />
    );

    const footerEl = screen.queryByTestId('footer');
    expect(footerEl !== null).toBe(true);
  });

  it('passes animation config to outer Box', () => {
    const page = createPage({
      entry: 'slideIn',
      exit: 'slideOut',
      entrySpeed: 2,
      exitSpeed: 3,
    });

    render(<PageShell page={page} controller={controllerMock} />); //here

    const outerBoxProps = boxMock.mock.calls[0][0];

    expect(outerBoxProps.animation).toEqual({
      entry: 'slideIn',
      exit: 'slideOut',
      entrySpeed: 2,
      exitSpeed: 3,
      controller: controllerMock,
    });
  });

  it('applies centering props when page.centered is true', () => {
    const page = createPage({ centered: true });

    render(<PageShell page={page} controller={controllerMock} />); //here

    const innerBoxProps = boxMock.mock.calls[1][0];

    expect(innerBoxProps.align).toBe('center');
    expect(innerBoxProps.justify).toBe('center');
  });

  it('does not apply centering props when page.centered is false', () => {
    const page = createPage({ centered: false });

    render(<PageShell page={page} controller={controllerMock} />); //here

    const innerBoxProps = boxMock.mock.calls[1][0];

    expect(innerBoxProps.align === undefined).toBe(true);
    expect(innerBoxProps.justify === undefined).toBe(true);
  });
});