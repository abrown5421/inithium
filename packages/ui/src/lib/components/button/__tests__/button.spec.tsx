import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../Button';
import { useTheme } from '../../../theme/ThemeProvider';

jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

describe('Button component', () => {
  const mockTheme = {
    theme: {
      colors: {
        neutral: {
          bg: '#ffffff',
          text: '#000000',
          border: '#cccccc',
          hover: '#eeeeee',
          active: '#dddddd',
          subtle: '#f5f5f5',
        },
        primary: {
          bg: '#007bff',
          text: '#ffffff',
          border: '#0056b3',
          hover: '#3399ff',
          active: '#004999',
          subtle: '#cce0ff',
        },
      },
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' }) as HTMLButtonElement;
    expect(button).toBeInTheDocument();
  });

  it('applies default theme styles', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button', { name: 'Test' }) as HTMLButtonElement;

    expect(button).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.neutral.bg,
      color: mockTheme.theme.colors.neutral.text,
      border: `1px solid ${mockTheme.theme.colors.neutral.border}`,
    });
  });

  it('applies the correct theme variant', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: 'Primary' }) as HTMLButtonElement;

    expect(button).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.primary.bg,
      color: mockTheme.theme.colors.primary.text,
      border: `1px solid ${mockTheme.theme.colors.primary.border}`,
    });
  });

  it('applies size styles correctly', () => {
    render(<Button size="small">Small</Button>);
    const button = screen.getByRole('button', { name: 'Small' }) as HTMLButtonElement;

    expect(button.style.padding).toBe('4px 10px');
    expect(button.style.fontSize).toBe('0.75rem');
  });

  it('applies fullWidth when fullWidth is true', () => {
    render(<Button fullWidth>Wide</Button>);
    const button = screen.getByRole('button', { name: 'Wide' }) as HTMLButtonElement;

    expect(button.style.width).toBe('100%');
  });

  it('renders startIcon and endIcon', () => {
    render(
      <Button
        startIcon={<span data-testid="start-icon">S</span>}
        endIcon={<span data-testid="end-icon">E</span>}
      >
        Icon Button
      </Button>
    );

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('applies hover styles on mouse enter', () => {
    render(<Button>Hover</Button>);
    const button = screen.getByRole('button', { name: 'Hover' }) as HTMLButtonElement;

    fireEvent.mouseEnter(button);

    expect(button).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.neutral.hover,
    });
  });

  it('applies active styles on mouse down', () => {
    render(<Button>Active</Button>);
    const button = screen.getByRole('button', { name: 'Active' }) as HTMLButtonElement;

    fireEvent.mouseEnter(button);
    fireEvent.mouseDown(button);

    expect(button).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.neutral.active,
    });
  });

  it('applies disabled styles and disables interaction', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' }) as HTMLButtonElement;

    expect(button).toBeDisabled();
    expect(button).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.neutral.subtle,
      cursor: 'not-allowed',
      opacity: '0.6',
    });
  });

  it('applies custom style overrides', () => {
    render(<Button style={{ margin: '12px' }}>Styled</Button>);
    const button = screen.getByRole('button', { name: 'Styled' }) as HTMLButtonElement;

    expect(button.style.margin).toBe('12px');
  });

  it('forwards button props correctly', () => {
    const handleClick = jest.fn();

    render(<Button onClick={handleClick}>Click</Button>);
    const button = screen.getByRole('button', { name: 'Click' }) as HTMLButtonElement;

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
