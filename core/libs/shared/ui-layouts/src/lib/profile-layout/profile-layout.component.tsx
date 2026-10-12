import type { ReactNode } from 'react';
import type { AvatarRecipe, PolyPattern } from '@inithium/shared-contracts';
import { Container, Text } from '@inithium/shared-ui-components';
import { Avatar, PolyBanner } from '@inithium/shared-ui-composites';

export type ProfileLayoutProps = {
  /** The profile's name, shown as the page's heading and drawn as the avatar's initials. */
  name: string;
  /** The avatar's recipe. */
  avatar: AvatarRecipe;
  /** The banner's recipe. */
  banner: PolyPattern;
  /** Makes the avatar editable (its pencil opens the editor) and receives the saved recipe. */
  onAvatarChange?: (recipe: AvatarRecipe) => void;
  /** Makes the banner editable and receives the saved recipe. */
  onBannerChange?: (pattern: PolyPattern) => void;
  /** Under the name, e.g. a short line about the profile. */
  subtitle?: ReactNode;
  /** Buttons under the name, e.g. 'Add friend'. */
  actions?: ReactNode;
  /** The rest of the sidebar, under the name and actions. */
  sidebar?: ReactNode;
  /** The main column, e.g. the profile's tabs. */
  children?: ReactNode;
};

const SIDEBAR = { color: 'surface', intensity: 100 } as const;

/**
 * A profile's frame (decisions 0081, 0090, 0091), full width: a PolyBanner, then two columns like the CMS frame. The
 * raised sidebar (surface 100, with a shadow) starts with the Avatar overlapping the banner's bottom edge, the name
 * and the actions, then the sidebar's content; the main column (surface 200) holds the rest. They stack below
 * 768px and fill the height they're given. Data only: the page supplies the recipes, edit callbacks and content.
 * Use it inside FullWidthLayout.
 */
export function ProfileLayout({
  name,
  avatar,
  banner,
  onAvatarChange,
  onBannerChange,
  subtitle,
  actions,
  sidebar,
  children,
}: ProfileLayoutProps) {
  return (
    <Container flex={{ direction: 'column' }} flexItem={{ grow: 1 }} width="full">
      <PolyBanner
        value={banner}
        onChange={onBannerChange}
        editable={Boolean(onBannerChange)}
        label={`${name}'s banner`}
        height={{ base: 140, md: 220 }}
      />
      <Container flex={{ direction: { base: 'column', md: 'row' } }} flexItem={{ grow: 1 }} width="full">
        <Container
          as="aside"
          aria-label="About this profile"
          flex={{ direction: 'column', gap: 24 }}
          flexItem={{ shrink: 0 }}
          width={{ base: 'full', md: 320 }}
          minWidth={0}
          padding={{ base: { x: 24, bottom: 32 }, md: { x: 28, bottom: 40 } }}
          position={{ type: 'relative', z: 1 }}
          bgColor={SIDEBAR}
          shadow="2xl"
        >
          <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
            {/* The ring around the avatar, in the sidebar's colour, overlapping the banner by half. */}
            <Container
              position={{ type: 'relative' }}
              margin={{ base: { top: -52 }, md: { top: -68 } }}
              padding={{ all: 4 }}
              radius={{ all: 9999 }}
              bgColor={SIDEBAR}
            >
              <Avatar
                value={avatar}
                onChange={onAvatarChange}
                editable={Boolean(onAvatarChange)}
                name={name}
                label={`${name}'s avatar`}
                width={{ base: 96, md: 128 }}
                height={{ base: 96, md: 128 }}
              />
            </Container>
            <Container maxWidth="full" minWidth={0}>
              <Text as="h1" fontFamily="display" fontSize={26} lineHeight={1.2}>
                {name}
              </Text>
              {subtitle}
            </Container>
            {actions && <Container flex={{ direction: 'row', wrap: 'wrap', gap: 8 }}>{actions}</Container>}
          </Container>
          {sidebar}
        </Container>
        <Container
          flexItem={{ grow: 1 }}
          minWidth={0}
          padding={{ base: { all: 24 }, md: { all: 32 } }}
          bgColor={{ color: 'surface', intensity: 200 }}
        >
          {children}
        </Container>
      </Container>
    </Container>
  );
}
