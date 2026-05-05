import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const mockTriggerExit = vi.fn().mockResolvedValue(undefined);

vi.mock('@inithium/store', () => ({
  usePageTransition: () => ({
    controller: { triggerExit: mockTriggerExit },
  }),
}));

vi.mock('../../components/box', () => ({
  Box: ({ as: Tag = 'div', children, ...props }: any) => <Tag {...props}>{children}</Tag>,
}));

vi.mock('../../components/text', () => ({
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));

vi.mock('../../components/icon', () => ({
  Icon: ({ name }: any) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../../components/dropdown', () => ({
  Dropdown: ({ trigger, items, onSelect }: any) => (
    <div data-testid="dropdown">
      <button data-testid="dropdown-trigger" onClick={() => {}}>
        {trigger}
      </button>
      {items.map((item: any) => (
        <button
          key={item.value}
          data-testid={`dropdown-item-${item.value}`}
          onClick={() => onSelect(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

import { Footer } from './footer';
import type { PageRegistryEntry } from '../navbar/navbar.types';

const mainLink = (): PageRegistryEntry =>
  ({ path: '/home', label: 'Home', location: 'main' } as any);

const footerLink = (): PageRegistryEntry =>
  ({ path: '/privacy', label: 'Privacy', location: 'footer' } as any);

const mainLinkViaNavigation = (): PageRegistryEntry =>
  ({ path: '/about', label: 'About', navigation: { location: 'main' } } as any);

const hiddenLink = (): PageRegistryEntry =>
  ({ path: '/hidden', label: 'Hidden', location: 'main', showInNav: false } as any);

const mainGroup = (): PageRegistryEntry =>
  ({
    path: '/products',
    label: 'Products',
    type: 'group',
    location: 'main',
    children: [
      { path: '/products/a', label: 'Product A', showInNav: true },
      { path: '/products/b', label: 'Product B', showInNav: true },
    ],
  } as any);

const footerGroup = (): PageRegistryEntry =>
  ({
    path: '/legal',
    label: 'Legal',
    type: 'group',
    location: 'footer',
    children: [
      { path: '/legal/terms', label: 'Terms', showInNav: true },
      { path: '/legal/cookies', label: 'Cookies', showInNav: true },
    ],
  } as any);

const groupWithHiddenChild = (): PageRegistryEntry =>
  ({
    path: '/misc',
    label: 'Misc',
    type: 'group',
    location: 'footer',
    children: [
      { path: '/misc/visible', label: 'Visible', showInNav: true },
      { path: '/misc/hidden', label: 'Hidden Child', showInNav: false },
    ],
  } as any);

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('structure', () => {
    it('renders a <footer> element', () => {
      render(<Footer pages={[]} />);
      expect(document.querySelector('footer')).not.toBeNull();
    });

    it('renders the copyright text', () => {
      render(<Footer pages={[]} copyright="© 2024 Acme Inc." />);
      expect(screen.getByText('© 2024 Acme Inc.')).not.toBeNull();
    });

    it('renders default copyright containing the current year', () => {
      render(<Footer pages={[]} />);
      const year = new Date().getFullYear().toString();
      expect(screen.getByText((text) => text.includes(year))).not.toBeNull();
    });

    it('renders the separator pipe character', () => {
      render(<Footer pages={[]} />);
      expect(screen.getByText('|')).not.toBeNull();
    });
  });

  describe('page location routing', () => {
    it('renders main-location pages in the primary nav', () => {
      render(<Footer pages={[mainLink()]} />);
      expect(screen.getByRole('link', { name: 'Home' })).not.toBeNull();
    });

    it('renders footer-location pages in the secondary nav', () => {
      render(<Footer pages={[footerLink()]} />);
      expect(screen.getByRole('link', { name: 'Privacy' })).not.toBeNull();
    });

    it('does not render footer pages in the primary nav', () => {
      render(<Footer pages={[footerLink()]} />);
      expect(
        screen.queryByRole('navigation', { name: 'Footer primary navigation' })
      ).toBeNull();
    });

    it('does not render main pages in the secondary nav', () => {
      render(<Footer pages={[mainLink()]} />);
      expect(
        screen.queryByRole('navigation', { name: 'Footer secondary navigation' })
      ).toBeNull();
    });

    it('supports navigation.location as an alternative to top-level location', () => {
      render(<Footer pages={[mainLinkViaNavigation()]} />);
      expect(screen.getByRole('link', { name: 'About' })).not.toBeNull();
    });

    it('treats pages with no location as main', () => {
      const page = { path: '/no-loc', label: 'No Loc' } as any;
      render(<Footer pages={[page]} />);
      expect(screen.getByRole('link', { name: 'No Loc' })).not.toBeNull();
    });
  });

  describe('FooterPrimaryNav', () => {
    it('renders the primary nav landmark', () => {
      render(<Footer pages={[mainLink()]} />);
      expect(
        screen.getByRole('navigation', { name: 'Footer primary navigation' })
      ).not.toBeNull();
    });

    it('does not render primary nav when all main pages are hidden', () => {
      render(<Footer pages={[hiddenLink()]} />);
      expect(
        screen.queryByRole('navigation', { name: 'Footer primary navigation' })
      ).toBeNull();
    });

    it('does not render primary nav when there are no main pages', () => {
      render(<Footer pages={[footerLink()]} />);
      expect(
        screen.queryByRole('navigation', { name: 'Footer primary navigation' })
      ).toBeNull();
    });

    it('renders a link for each visible main page', () => {
      render(<Footer pages={[mainLink(), mainLinkViaNavigation()]} />);
      expect(screen.getByRole('link', { name: 'Home' })).not.toBeNull();
      expect(screen.getByRole('link', { name: 'About' })).not.toBeNull();
    });

    it('does not render hidden main pages', () => {
      render(<Footer pages={[hiddenLink()]} />);
      expect(screen.queryByRole('link', { name: 'Hidden' })).toBeNull();
    });

    it('links have the correct href', () => {
      render(<Footer pages={[mainLink()]} />);
      expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home');
    });

    it('renders a dropdown for group pages', () => {
      render(<Footer pages={[mainGroup()]} />);
      expect(screen.getByTestId('dropdown')).not.toBeNull();
    });

    it('renders dropdown items for each group child', () => {
      render(<Footer pages={[mainGroup()]} />);
      expect(screen.getByTestId('dropdown-item-/products/a')).not.toBeNull();
      expect(screen.getByTestId('dropdown-item-/products/b')).not.toBeNull();
    });

    it('does not render a dropdown when all group children are hidden', () => {
      const emptyGroup = {
        path: '/empty',
        label: 'Empty',
        type: 'group',
        location: 'main',
        children: [{ path: '/empty/x', label: 'X', showInNav: false }],
      } as any;
      render(<Footer pages={[emptyGroup]} />);
      expect(screen.queryByTestId('dropdown')).toBeNull();
    });
  });

  describe('FooterSecondaryNav', () => {
    it('renders the secondary nav landmark', () => {
      render(<Footer pages={[footerLink()]} />);
      expect(
        screen.getByRole('navigation', { name: 'Footer secondary navigation' })
      ).not.toBeNull();
    });

    it('renders a link for each visible footer page', () => {
      render(<Footer pages={[footerLink()]} />);
      expect(screen.getByRole('link', { name: 'Privacy' })).not.toBeNull();
    });

    it('flattens group children into individual links', () => {
      render(<Footer pages={[footerGroup()]} />);
      expect(screen.getByRole('link', { name: 'Terms' })).not.toBeNull();
      expect(screen.getByRole('link', { name: 'Cookies' })).not.toBeNull();
    });

    it('excludes hidden children from flattened group links', () => {
      render(<Footer pages={[groupWithHiddenChild()]} />);
      expect(screen.getByRole('link', { name: 'Visible' })).not.toBeNull();
      expect(screen.queryByRole('link', { name: 'Hidden Child' })).toBeNull();
    });

    it('links have the correct href', () => {
      render(<Footer pages={[footerLink()]} />);
      expect(screen.getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
    });
  });

  describe('navigation callbacks', () => {
    it('calls triggerExit before onNavigate for a primary nav link', async () => {
      const onNavigate = vi.fn();
      render(<Footer pages={[mainLink()]} onNavigate={onNavigate} />);
      await fireEvent.click(screen.getByRole('link', { name: 'Home' }));
      expect(mockTriggerExit).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/home');
    });

    it('calls triggerExit before onNavigate for a secondary nav link', async () => {
      const onNavigate = vi.fn();
      render(<Footer pages={[footerLink()]} onNavigate={onNavigate} />);
      await fireEvent.click(screen.getByRole('link', { name: 'Privacy' }));
      expect(mockTriggerExit).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/privacy');
    });

    it('calls onNavigate with the correct path when a dropdown item is selected', async () => {
      const onNavigate = vi.fn();
      render(<Footer pages={[mainGroup()]} onNavigate={onNavigate} />);
      await fireEvent.click(screen.getByTestId('dropdown-item-/products/a'));
      expect(mockTriggerExit).toHaveBeenCalledTimes(1);
      expect(onNavigate).toHaveBeenCalledWith('/products/a');
    });

    it('does not throw when onNavigate is not provided', () => {
        render(<Footer pages={[mainLink()]} />);

        expect(() => {
            fireEvent.click(screen.getByRole('link', { name: 'Home' }));
        }).not.toThrow();
    });

    it('prevents default on primary nav link click', () => {
      render(<Footer pages={[mainLink()]} />);
      const link = screen.getByRole('link', { name: 'Home' });
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('prevents default on secondary nav link click', () => {
      render(<Footer pages={[footerLink()]} />);
      const link = screen.getByRole('link', { name: 'Privacy' });
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });
});