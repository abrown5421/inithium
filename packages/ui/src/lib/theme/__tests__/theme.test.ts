import { lightTheme, darkTheme } from '../theme';

describe('Theme existence', () => {
  test('lightTheme and darkTheme are defined', () => {
    expect(lightTheme).toBeDefined();
    expect(darkTheme).toBeDefined();
  });

  test('lightTheme and darkTheme have colors object', () => {
    expect(lightTheme.colors).toBeDefined();
    expect(darkTheme.colors).toBeDefined();
  });

  test('themes contain expected color keys', () => {
    const expectedKeys = ['primary', 'secondary', 'accent', 'neutral', 'success', 'error', 'warning', 'info', 'surface'];

    const lightKeys = Object.keys(lightTheme.colors).sort();
    const darkKeys = Object.keys(darkTheme.colors).sort();
    const expectedSorted = expectedKeys.sort();

    expect(lightKeys).toEqual(expectedSorted);
    expect(darkKeys).toEqual(expectedSorted);
  });
});
