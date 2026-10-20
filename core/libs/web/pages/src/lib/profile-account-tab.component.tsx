import { useRef, useState, type FormEvent } from 'react';
import { bioFeatures, profileLimits, updateProfileRequestSchema, type RichTextDocument } from '@inithium/shared-contracts';
import {
  fieldErrorsFrom,
  focusFirstError,
  readApiFailure,
  useAlerts,
  useUpdateMyProfileMutation,
  type FieldErrors,
} from '@inithium/shared-data-access';
import { Button, Container, Input, Text } from '@inithium/shared-ui-components';
import { RichTextField } from '@inithium/shared-ui-composites';
import { PROFILE_CARD_GAP, profileCard } from './profile-card.config';
import type { ProfileSlotProps } from './profile-slots.types';

type Field = 'firstName' | 'lastName' | 'bio';
type NameField = 'firstName' | 'lastName';
const FIELDS: readonly Field[] = ['firstName', 'lastName', 'bio'];
const INVALID = { title: 'There were problems saving your profile', message: 'Check the highlighted fields below.' };

/**
 * Core's Account tab, for the profile's owner only (decision 0090): their names and bio (rich text, decision 0102) and
 * their email (read-only until email changes exist). The password change is on the Settings tab (decision 0119).
 * Saving follows every form's pattern (decision 0083).
 */
export function ProfileAccountTab({ profile }: ProfileSlotProps) {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const { show: showAlert, dismiss: dismissAlert } = useAlerts();
  const lastAlert = useRef<string | null>(null);
  const [values, setValues] = useState<Record<NameField, string>>({
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
  });
  const [bio, setBio] = useState<RichTextDocument | undefined>(profile.bio);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  const field = (name: NameField) => ({
    name,
    value: values[name],
    onValueChange: (value: string) => setValues((current) => ({ ...current, [name]: value })),
    error: errors[name],
  });

  const fail = (form: HTMLFormElement, found: FieldErrors<Field>, title: string, message: string) => {
    setErrors(found);
    if (lastAlert.current) dismissAlert(lastAlert.current);
    lastAlert.current = showAlert({ color: 'red', icon: 'circle-alert', title, message, urgent: true });
    focusFirstError(FIELDS, found, form);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    // No bio (or one with no text) is sent as null, which removes it.
    const parsed = updateProfileRequestSchema.safeParse({ ...values, bio: bio ?? null });
    if (!parsed.success) return fail(form, fieldErrorsFrom<Field>(parsed.error.issues), INVALID.title, INVALID.message);

    setErrors({});
    try {
      await updateProfile(parsed.data).unwrap();
      if (lastAlert.current) dismissAlert(lastAlert.current);
      lastAlert.current = showAlert({ color: 'green', icon: 'circle-check', title: 'Profile saved', message: 'Your changes are live.' });
    } catch (error) {
      const failure = readApiFailure(error);
      if (failure.issues) return fail(form, fieldErrorsFrom<Field>(failure.issues), INVALID.title, INVALID.message);
      fail(form, {}, "We couldn't save your profile", failure.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <Container flex={{ direction: 'column', gap: PROFILE_CARD_GAP }}>
      <Container as="section" {...profileCard}>
        <form onSubmit={handleSubmit} noValidate>
          <Container flex={{ direction: 'column', gap: 20 }}>
            <Text as="h2" fontFamily="display" fontSize={20}>
              Profile
            </Text>
            <Input label="First name" autoComplete="given-name" required {...field('firstName')} />
            <Input label="Last name" autoComplete="family-name" helperText="Optional" {...field('lastName')} />
            <RichTextField
              label="Bio"
              value={bio}
              onChange={setBio}
              features={bioFeatures}
              maxLength={profileLimits.bio}
              minHeight={80}
              placeholder="A few words about you"
              helperText="Optional. Shown on your profile."
              error={errors.bio}
            />
            <Input label="Email" value={profile.email ?? ''} disabled helperText="Only you can see this. It can't be changed yet." />
            <Container flex={{ direction: 'row' }}>
              <Button type="submit" leadingIcon="save" loading={isLoading}>
                Save profile
              </Button>
            </Container>
          </Container>
        </form>
      </Container>
    </Container>
  );
}
