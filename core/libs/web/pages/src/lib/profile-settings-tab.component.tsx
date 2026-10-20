import { useRef } from 'react';
import { colorSchemeSchema } from '@inithium/shared-contracts';
import { PasswordChangeForm } from '@inithium/shared-auth-ui';
import { readApiFailure, useAlerts, useGetCurrentUserQuery, useUpdateMyPreferencesMutation } from '@inithium/shared-data-access';
import { Container, RadioGroup, Text, type RadioGroupOption } from '@inithium/shared-ui-components';
import { useSite } from '@inithium/web-shell';
import { PROFILE_CARD_GAP, profileCard } from './profile-card.config';
import type { ProfileSlotProps } from './profile-slots.types';

const COLOR_SCHEME_OPTIONS: RadioGroupOption[] = [
  { value: 'system', label: 'System', helperText: 'Follows your device.', icon: 'monitor' },
  { value: 'light', label: 'Light', helperText: 'Always light.', icon: 'sun' },
  { value: 'dark', label: 'Dark', helperText: 'Always dark.', icon: 'moon' },
];

/** A card's heading and the line under it. */
function CardHeading({ title, description }: { title: string; description: string }) {
  return (
    <Container flex={{ direction: 'column', gap: 6 }}>
      <Text as="h2" fontFamily="display" fontSize={20}>
        {title}
      </Text>
      <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
        {description}
      </Text>
    </Container>
  );
}

/**
 * Core's Settings tab, for the profile's owner only (decision 0119): their colour scheme (System, Light or Dark, saved
 * as soon as it's picked, and hidden while the site has dark mode off) and a password change (decision 0088).
 */
export function ProfileSettingsTab(_props: ProfileSlotProps) {
  const { settings } = useSite();
  const { data: user } = useGetCurrentUserQuery();
  const [updatePreferences] = useUpdateMyPreferencesMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);

  const changeColorScheme = async (value: string) => {
    const colorScheme = colorSchemeSchema.safeParse(value);
    if (!colorScheme.success) return;
    if (lastAlert.current) dismissAlert(lastAlert.current);
    try {
      // The page switches at once; a failure switches it back.
      await updatePreferences({ colorScheme: colorScheme.data }).unwrap();
    } catch (error) {
      const message = readApiFailure(error).message ?? 'Something went wrong. Please try again.';
      lastAlert.current = showAlert({ color: 'red', icon: 'circle-alert', title: "We couldn't save your colour scheme", message, urgent: true });
    }
  };

  return (
    <Container flex={{ direction: 'column', gap: PROFILE_CARD_GAP }}>
      {settings.darkMode && user && (
        <Container as="section" {...profileCard} flex={{ direction: 'column', gap: 20 }}>
          <CardHeading title="Appearance" description="How the site looks for you, on every device you sign in on." />
          <RadioGroup
            name="colorScheme"
            label="Colour scheme"
            variant="card"
            orientation="horizontal"
            options={COLOR_SCHEME_OPTIONS}
            value={user.preferences.colorScheme}
            onValueChange={(value) => void changeColorScheme(value)}
          />
        </Container>
      )}
      <Container as="section" {...profileCard}>
        <PasswordChangeForm intro={<CardHeading title="Password" description="Changing it signs you out everywhere else." />} />
      </Container>
    </Container>
  );
}
