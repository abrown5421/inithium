import type { ComponentType } from 'react';
import type { ProfileViewer, PublicProfile } from '@inithium/shared-contracts';
import type { IconName } from '@inithium/shared-ui-components';

/** What every profile slot component receives (decision 0081): the profile on screen and who is looking at it. */
export type ProfileSlotProps = {
  profile: PublicProfile;
  viewer: ProfileViewer;
};

/** What every profile slot entry has (decision 0090). */
export type ProfileSlotEntry = {
  /** Unique within its slot, e.g. 'orders'. A tab's key is its `?tab=` value. */
  key: string;
  /** Position within its slot, lowest first. Core's own entries use 0 (first) and 1000 (last). */
  order: number;
  /** Who sees it; it's left out for everyone else. */
  viewers: readonly ProfileViewer[];
  /** Draws it, and may render differently for each viewer. */
  component: ComponentType<ProfileSlotProps>;
};

/** A tab in the profile's right column, e.g. Orders. */
export type ProfileTab = ProfileSlotEntry & { label: string; icon?: IconName };

/** A section in the profile's identity sidebar, e.g. an address, under its own heading. */
export type ProfileSidebarSection = ProfileSlotEntry & { label: string };

/** A button beside the profile's name, e.g. 'Add friend'. Its component renders the button. */
export type ProfileHeaderAction = ProfileSlotEntry;

/** Everything plugins and `libs/client/` add to the profile page, through the web registry. */
export type ProfileSlots = {
  tabs: ProfileTab[];
  sidebarSections: ProfileSidebarSection[];
  headerActions: ProfileHeaderAction[];
};
