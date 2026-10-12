import type { ReactNode } from 'react';
import type { AvatarRecipe, PolyPattern } from '@inithium/shared-contracts';
import { Text } from '@inithium/shared-ui-components';
import { Avatar, PolyBanner } from '@inithium/shared-ui-composites';
import { profileLayoutStyleSheet } from './profile-layout.styles';

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
  /** Buttons beside the name, e.g. 'Add friend'. */
  actions?: ReactNode;
  /** The left column: the identity sidebar's sections. */
  sidebar?: ReactNode;
  /** The right column, e.g. the profile's tabs. */
  children?: ReactNode;
};

/**
 * A profile's frame (decisions 0081, 0090): a full-width PolyBanner, the Avatar overlapping its bottom edge with the
 * name and actions beside it, then an identity sidebar on the left and the main content on the right, stacked below
 * 768px. Data only: the page that uses it supplies the recipes, the edit callbacks and the columns' content. Use
 * it inside FullWidthLayout.
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
    <div className="ui-profile">
      {/* React hoists this to <head> and keeps one copy however many render. */}
      <style href="inithium-profile-layout" precedence="default">
        {profileLayoutStyleSheet}
      </style>
      <PolyBanner
        value={banner}
        onChange={onBannerChange}
        editable={Boolean(onBannerChange)}
        label={`${name}'s banner`}
        height={{ base: 140, md: 220 }}
      />
      <div className="ui-profile-frame">
        <div className="ui-profile-head">
          <div className="ui-profile-avatar">
            <Avatar
              value={avatar}
              onChange={onAvatarChange}
              editable={Boolean(onAvatarChange)}
              name={name}
              label={`${name}'s avatar`}
              width={{ base: 96, md: 128 }}
              height={{ base: 96, md: 128 }}
            />
          </div>
          <div className="ui-profile-title">
            <Text as="h1" fontFamily="display" fontSize={28} lineHeight={1.2}>
              {name}
            </Text>
            {subtitle}
          </div>
          {actions && <div className="ui-profile-actions">{actions}</div>}
        </div>
        <div className="ui-profile-body">
          <aside className="ui-profile-sidebar" aria-label="About this profile">
            {sidebar}
          </aside>
          <div className="ui-profile-main">{children}</div>
        </div>
      </div>
    </div>
  );
}
