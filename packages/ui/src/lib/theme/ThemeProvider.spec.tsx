import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { lightTheme, darkTheme } from './theme';

describe('ThemeProvider', () => {
  it('should render children', () => {
    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );
    expect(screen.getByText('Test Content')).toBeTruthy();
  });

  it('should provide light theme by default', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>{theme.mode}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByText('light')).toBeTruthy();
  });

  it('should provide dark theme when initialMode is dark', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>{theme.mode}</div>;
    };

    render(
      <ThemeProvider initialMode="dark">
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByText('dark')).toBeTruthy();
  });

  it('should provide theme colors', () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return <div>{theme.colors.primary.bg}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByText(lightTheme.colors.primary.bg)).toBeTruthy();
  });
});