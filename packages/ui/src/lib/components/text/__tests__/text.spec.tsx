import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { Text } from '../Text';
import { useTheme } from '../../../theme/ThemeProvider';

jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

describe('Text component', () => {
  const mockTheme = {
    theme: {
      colors: {
        neutral: { bg: '#fff', text: '#000', border: '#ccc', hover: '', active: '', subtle: '' },
        primary: { bg: '#007bff', text: '#fff', border: '#0056b3', hover: '', active: '', subtle: '' },
      },
    },
  };

  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders children correctly', () => {
    const { getByText } = render(<Text>Test Text</Text>);
    expect(getByText('Test Text')).toBeInTheDocument();
  });

  it('applies default styles from theme', () => {
    const { container } = render(<Text>Test</Text>);
    const span = (container as any).firstElementChild as HTMLElement;
    expect(span).toHaveStyle({
      color: mockTheme.theme.colors.neutral.text,
      backgroundColor: mockTheme.theme.colors.neutral.bg,
      textAlign: 'left',
      textDecoration: 'none',
      textTransform: 'none',
    });
  });

  it('applies typography styles', () => {
    const { container } = render(
      <Text 
        size="18px" 
        weight="bold" 
        align="center" 
        decoration="underline"
        transform="uppercase"
        lineHeight="1.5"
        letterSpacing="2px"
      >
        Styled Text
      </Text>
    );
    const span = (container as any).firstElementChild as HTMLElement;
    expect((span as any).style.fontSize).toBe('18px');
    expect((span as any).style.fontWeight).toBe('bold');
    expect((span as any).style.textAlign).toBe('center');
    expect((span as any).style.textDecoration).toBe('underline');
    expect((span as any).style.textTransform).toBe('uppercase');
    expect((span as any).style.lineHeight).toBe('1.5');
    expect((span as any).style.letterSpacing).toBe('2px');
  });

  it('applies nowrap and truncate styles', () => {
    const { container } = render(
      <Text nowrap truncate>
        Long text that should be truncated
      </Text>
    );
    const span = (container as any).firstElementChild as HTMLElement;
    expect((span as any).style.whiteSpace).toBe('nowrap');
    expect((span as any).style.overflow).toBe('hidden');
    expect((span as any).style.textOverflow).toBe('ellipsis');
  });

  it('applies width, height, and custom styles', () => {
    const { container } = render(
      <Text width="200px" height="30px" style={{ padding: '5px' }}>
        Sized Text
      </Text>
    );
    const span = (container as any).firstElementChild as HTMLElement;
    expect((span as any).style.width).toBe('200px');
    expect((span as any).style.height).toBe('30px');
    expect((span as any).style.padding).toBe('5px');
  });

  it('applies the correct theme variant', () => {
    const { container } = render(<Text variant="primary">Primary Text</Text>);
    const span = (container as any).firstElementChild as HTMLElement;
    expect(span).toHaveStyle({
      color: mockTheme.theme.colors.primary.text,
      backgroundColor: mockTheme.theme.colors.primary.bg,
    });
  });
});