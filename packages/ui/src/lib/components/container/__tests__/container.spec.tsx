import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import { Container } from '../Container';
import { useTheme } from '../../../theme/ThemeProvider';

jest.mock('../../../theme/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

describe('Container component', () => {
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
    const { getByText } = render(
      <Container>
        <span>Test Child</span>
      </Container>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('applies default styles from theme', () => {
    const { container } = render(<Container>Test</Container>);
    const div = (container as any).firstElementChild as HTMLElement;
    expect(div).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.neutral.bg,
      color: mockTheme.theme.colors.neutral.text,
      borderColor: mockTheme.theme.colors.neutral.border,
    });
    expect((div as any).style.display).toBe('');
  });

  it('applies flex styles when flex prop is true', () => {
    const { container } = render(
      <Container flex direction="column" justify="center" align="center" gap="10px">
        Flex Content
      </Container>
    );
    const div = (container as any).firstElementChild as HTMLElement;
    expect((div as any).style.display).toBe('flex');
    expect((div as any).style.flexDirection).toBe('column');
    expect((div as any).style.justifyContent).toBe('center');
    expect((div as any).style.alignItems).toBe('center');
    expect((div as any).style.gap).toBe('10px');
  });

  it('applies width, height, and custom styles', () => {
    const { container } = render(
      <Container width="100px" height="50px" style={{ margin: '10px' }}>
        Styled
      </Container>
    );
    const div = (container as any).firstElementChild as HTMLElement;
    expect((div as any).style.width).toBe('100px');
    expect((div as any).style.height).toBe('50px');
    expect((div as any).style.margin).toBe('10px');
  });

  it('applies the correct theme variant', () => {
    const { container } = render(<Container variant="primary">Primary</Container>);
    const div = (container as any).firstElementChild as HTMLElement;
    expect(div).toHaveStyle({
      backgroundColor: mockTheme.theme.colors.primary.bg,
      color: mockTheme.theme.colors.primary.text,
      borderColor: mockTheme.theme.colors.primary.border,
    });
  });
});