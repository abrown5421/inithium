import type { ContainerProps } from '@inithium/shared-ui-components';

/**
 * The profile's cards (decision 0090): surface 100 boxes with padding, rounded corners and the sidebar's shadow, on
 * the surface 200 main column. Spread onto a Container; plugin tabs use it too, so their sections match.
 */
export const profileCard = {
  bgColor: { color: 'surface', intensity: 100 },
  padding: { base: { all: 20 }, md: { all: 28 } },
  radius: { all: 12 },
  shadow: '2xl',
} satisfies Partial<ContainerProps>;

/** The space between the profile's cards, in px. */
export const PROFILE_CARD_GAP = 24;
