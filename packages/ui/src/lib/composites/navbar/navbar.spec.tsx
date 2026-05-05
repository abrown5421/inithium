import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Navbar } from './navbar';
import type { NavbarProps, NavItemLink, PageRegistryEntry } from './navbar.types';

vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    pathname: '/',
  }),
}));

vi.mock('@inithium/store', () => ({
  usePageTransition: () => ({
    controller: {
      triggerExit: vi.fn().mockResolvedValue(undefined),
    },
  }),
  useLogoutMutation: () => [vi.fn().mockResolvedValue({ unwrap: vi.fn() })],
}));

vi.mock('@headlessui/react', async () => {
  const actual = await vi.importActual<any>('@headlessui/react');

  return {
    ...actual,
    Dialog: ({ children }: any) => <div>{children}</div>,
    DialogPanel: ({ children }: any) => <div>{children}</div>,
    DialogBackdrop: () => <div data-testid="backdrop" />,
  };
});

const createLink = (overrides?: Partial<NavItemLink>): NavItemLink => ({
  type: 'link',
  path: '/home',
  label: 'Home',
  ...overrides,
});

const createGroup = (): PageRegistryEntry => ({
  type: 'group',
  path: '/group',
  label: 'Group',
  children: [
    { path: '/child-1', label: 'Child 1' },
    { path: '/child-2', label: 'Child 2' },
  ],
});

const renderNavbar = (props?: Partial<NavbarProps>) => {
  const defaultProps: NavbarProps = {
    pages: [createLink()],
    isAuthenticated: false,
    onNavigate: vi.fn(),
    onLoginClick: vi.fn(),
  };

  return render(<Navbar {...defaultProps} {...props} />);
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders navigation links', () => {
      renderNavbar();

      const links = screen.getAllByRole('link', { name: 'Home' });
      expect(links.length).toBeGreaterThan(0);
    });

    it('renders logo title when provided', () => {
      renderNavbar({
        logo: { title: 'MyApp' },
      });

      expect(screen.getByText('MyApp')).toBeTruthy();
    });

    it('does not render nav when no visible pages', () => {
      renderNavbar({
        pages: [{ ...createLink(), showInNav: false }],
      });

      expect(screen.queryByRole('navigation')).toBeNull();
    });
  });

  describe('navigation behavior', () => {
    it('calls onNavigate when clicking a link', async () => {
      const onNavigate = vi.fn();
      renderNavbar({ onNavigate });

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      const link = within(nav).getByRole('link', { name: 'Home' });

      fireEvent.click(link);

      await waitFor(() => {
        expect(onNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('does not throw if onNavigate is not provided', () => {
      renderNavbar({ onNavigate: undefined });

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      const link = within(nav).getByRole('link', { name: 'Home' });

      expect(() => fireEvent.click(link)).not.toThrow();
    });
  });

  describe('group navigation', () => {
    it('renders group label', () => {
      renderNavbar({
        pages: [createGroup()],
      });

      expect(screen.getByText('Group')).toBeTruthy();
    });
  });

  describe('authentication states', () => {
    it('shows login button when not authenticated', () => {
      renderNavbar({ isAuthenticated: false });

      expect(screen.getByRole('button', { name: /login/i })).toBeTruthy();
    });

    it('calls onLoginClick when login button is clicked', async () => {
      const onLoginClick = vi.fn();

      renderNavbar({
        isAuthenticated: false,
        onLoginClick,
      });

      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(onLoginClick).toHaveBeenCalled();
      });
    });

    it('renders avatar when authenticated', () => {
      renderNavbar({
        isAuthenticated: true,
        user: {
          _id: '123',
          first_name: 'John',
          last_name: 'Doe',
        } as any,
      });

      expect(screen.getByText('JD')).toBeTruthy();
    });
  });

  describe('slideout behavior', () => {
    it('opens slideout when hamburger is clicked', () => {
      renderNavbar();

      const buttons = screen.getAllByRole('button');
      const hamburger = buttons[0]; // first button = hamburger

      fireEvent.click(hamburger);

      expect(screen.getByText(/navigation/i)).toBeTruthy();
    });

    it('renders profile links when authenticated', () => {
      renderNavbar({
        isAuthenticated: true,
        user: { _id: '123' } as any,
      });

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // hamburger

      expect(screen.getByText('Profile')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles empty pages array', () => {
      renderNavbar({ pages: [] });

      expect(screen.queryAllByRole('link').length).toBe(0);
    });

    it('handles missing user safely when authenticated', () => {
      renderNavbar({
        isAuthenticated: true,
        user: null,
      });

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});