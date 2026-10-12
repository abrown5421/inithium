import { createContext, useContext, type ReactNode } from 'react';
import type { ProfileSlots } from './profile-slots.types';

const NO_SLOTS: ProfileSlots = { tabs: [], sidebarSections: [], headerActions: [] };

const ProfileSlotsContext = createContext<ProfileSlots>(NO_SLOTS);

/** Hands the profile page the registry's tabs, sidebar sections and header actions (decision 0090). */
export function ProfileSlotsProvider({ slots, children }: { slots: ProfileSlots; children?: ReactNode }) {
  return <ProfileSlotsContext.Provider value={slots}>{children}</ProfileSlotsContext.Provider>;
}

/** The registered profile slots; none outside a ProfileSlotsProvider. */
export const useProfileSlots = (): ProfileSlots => useContext(ProfileSlotsContext);
