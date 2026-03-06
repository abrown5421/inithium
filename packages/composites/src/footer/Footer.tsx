import React, { useState, useEffect } from 'react';
import { NavLink, useIsAtLeast } from '@inithium/shared';
import { FooterProps } from './footer.types.js';

function useActivePath() {
  const [path, setPath] = useState(() =>
    typeof window !== 'undefined' ? window.location.pathname : ''
  );
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  return path;
}

function isActive(href: string | undefined, currentPath: string) {
  return !!href && (currentPath === href || currentPath.startsWith(href + '/'));
}

function FooterLinkItem({
  link,
  currentPath,
  variant = 'primary',
}: {
  link: NavLink;
  currentPath: string;
  variant?: 'primary' | 'secondary';
}) {
  const active = isActive(link.href, currentPath);

  const baseClass =
    'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm';

  const variantClass =
    variant === 'primary'
      ? [
          'text-sm font-medium',
          active
            ? 'text-primary font-semibold'
            : 'text-foreground hover:text-primary',
        ].join(' ')
      : [
          'text-xs',
          active
            ? 'text-muted-foreground/90 font-medium'
            : 'text-muted-foreground/60 hover:text-muted-foreground',
        ].join(' ');

  const handleClick = () => {
    if (link.href) {
      window.location.href = link.href;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClass} ${variantClass}`}
    >
      {link.label}
    </button>
  );
}

function FooterDropdownMobile({
  link,
  currentPath,
  variant = 'primary',
}: {
  link: NavLink;
  currentPath: string;
  variant?: 'primary' | 'secondary';
}) {
  const labelClass =
    variant === 'primary'
      ? 'text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1'
      : 'text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 pb-1';

  return (
    <div className="flex flex-col items-start gap-1">
      <span className={labelClass}>{link.label}</span>
      <div className="flex flex-col items-start gap-1 pl-3 border-l border-border">
        {link.dropdown!.map((item) => (
          <FooterLinkItem
            key={item.label}
            link={item}
            currentPath={currentPath}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

function flattenLinks(links: NavLink[]): NavLink[] {
  return links.flatMap((link) =>
    link.dropdown ? link.dropdown : [link]
  );
}

export const Footer: React.FC<FooterProps> = ({
  links,
  secondaryLinks,
  copyrightName,
  copyrightYear,
}) => {
  const isMobile = !useIsAtLeast('lg');
  const currentPath = useActivePath();
  const year = copyrightYear ?? new Date().getFullYear();

  const hasLinks = links && links.length > 0;
  const hasSecondaryLinks = secondaryLinks && secondaryLinks.length > 0;
  const hasAnyLinks = hasLinks || hasSecondaryLinks;

  const copyrightText = copyrightName
    ? `© ${year} ${copyrightName}`
    : `© ${year}`;

  if (isMobile) {
    return (
      <footer className="w-full border-t border-border bg-background">
        <div className="flex flex-col items-start gap-4 px-4 py-5">
          {hasLinks && (
            <nav aria-label="Footer navigation" className="flex flex-col items-start gap-2">
              {links!.map((link: NavLink) =>
                link.dropdown ? (
                  <FooterDropdownMobile
                    key={link.label}
                    link={link}
                    currentPath={currentPath}
                    variant="primary"
                  />
                ) : (
                  <FooterLinkItem
                    key={link.label}
                    link={link}
                    currentPath={currentPath}
                    variant="primary"
                  />
                )
              )}
            </nav>
          )}

          {hasSecondaryLinks && (
            <nav aria-label="Secondary footer navigation" className="flex flex-col items-start gap-1.5">
              {secondaryLinks!.map((link: NavLink) =>
                link.dropdown ? (
                  <FooterDropdownMobile
                    key={link.label}
                    link={link}
                    currentPath={currentPath}
                    variant="secondary"
                  />
                ) : (
                  <FooterLinkItem
                    key={link.label}
                    link={link}
                    currentPath={currentPath}
                    variant="secondary"
                  />
                )
              )}
            </nav>
          )}

          <span className="text-xs text-muted-foreground/60">{copyrightText}</span>
        </div>
      </footer>
    );
  }

  if (!hasAnyLinks) {
    return (
      <footer className="w-full border-t border-border bg-background">
        <div className="flex h-12 items-center justify-center px-6">
          <span className="text-xs text-muted-foreground/60">{copyrightText}</span>
        </div>
      </footer>
    );
  }

  const flatLinks = hasLinks ? flattenLinks(links!) : [];
  const flatSecondaryLinks = hasSecondaryLinks ? flattenLinks(secondaryLinks!) : [];

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="flex flex-col px-6 py-4 gap-1">

        {flatLinks.length > 0 && (
          <nav
            aria-label="Footer navigation"
            className="flex items-center gap-5"
          >
            {flatLinks.map((link: NavLink) => (
              <FooterLinkItem
                key={link.label}
                link={link}
                currentPath={currentPath}
                variant="primary"
              />
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground/60 shrink-0">
            {copyrightText}
          </span>

          {flatSecondaryLinks.length > 0 && (
            <>
              <span className="text-muted-foreground/30 text-xs select-none" aria-hidden="true">
                |
              </span>
              <nav
                aria-label="Secondary footer navigation"
                className="flex items-center gap-4"
              >
                {flatSecondaryLinks.map((link: NavLink) => (
                  <FooterLinkItem
                    key={link.label}
                    link={link}
                    currentPath={currentPath}
                    variant="secondary"
                  />
                ))}
              </nav>
            </>
          )}
        </div>

      </div>
    </footer>
  );
};