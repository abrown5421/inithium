import React, { useEffect, useState } from 'react';
import type { Address, Gender, GenderSelection } from '@inithium/types';
import { useGetMeQuery, useUpdateMeMutation } from '@inithium/store';
import { Box, Text, Input, Select, Textarea, Button } from '@inithium/ui';

export interface ProfileEditFormProps {
  userId: string;
  onSaved?: () => void;
}

interface ProfileFormState {
  first_name: string;
  last_name: string;
  bio: string;
  phone_number: string;
  dob: string;
  gender_type: GenderSelection | '';
  gender_custom: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Prefer Not to Say', label: 'Prefer Not to Say' },
  { value: 'Other', label: 'Other' },
];

const FormSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box direction="col" className="mb-8">
    {children}
  </Box>
);

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ userId, onSaved }) => {
  const { data: user, isLoading } = useGetMeQuery(userId, { skip: !userId });
  const [updateMe, { isLoading: isSaving, isError, error }] = useUpdateMeMutation();

  const [form, setForm] = useState<ProfileFormState>({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
    dob: '',
    gender_type: '',
    gender_custom: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        bio: user.bio ?? '',
        phone_number: user.phone_number ?? '',
        dob: user.dob ?? '',
        gender_type: (user.gender?.type as GenderSelection) ?? '',
        gender_custom: user.gender?.custom ?? '',
        street: user.address?.street ?? '',
        city: user.address?.city ?? '',
        state: user.address?.state ?? '',
        zip: user.address?.zip ?? '',
        country: user.address?.country ?? '',
      });
    }
  }, [user]);

  const setField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    const address: Address = {
      street: form.street || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      zip: form.zip || undefined,
      country: form.country || undefined,
    };

    const hasAddress = Object.values(address).some(Boolean);

    let gender: Gender | undefined;
    if (form.gender_type === 'Other') {
      gender = { type: 'Other', custom: form.gender_custom };
    } else if (form.gender_type) {
      gender = { type: form.gender_type as Exclude<GenderSelection, 'Other'> };
    }

    const patch: Parameters<typeof updateMe>[0]['patch'] = {
      first_name: form.first_name || undefined,
      last_name: form.last_name || undefined,
      bio: form.bio || undefined,
      phone_number: form.phone_number || undefined,
      dob: form.dob || undefined,
      gender,
      address: hasAddress ? address : undefined,
    };

    await updateMe({ userId, patch });
    setIsDirty(false);
    setSuccessMsg('Profile updated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
    onSaved?.();
  };

  if (isLoading) {
    return (
      <Box justify="center" align="center" className="py-16">
        <Text size="sm" color="surface2-contrast">Loading profile…</Text>
      </Box>
    );
  }

  return (
    <Box direction="col" fullWidth>
      <FormSection>
        <Box direction="col" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First Name"
            placeholder="Jane"
            value={form.first_name}
            onChange={(e) => setField('first_name', e.target.value)}
            color="primary"
            variant="outlined"
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={form.last_name}
            onChange={(e) => setField('last_name', e.target.value)}
            color="primary"
            variant="outlined"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={(e) => setField('dob', e.target.value)}
            color="primary"
            variant="outlined"
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone_number}
            onChange={(e) => setField('phone_number', e.target.value)}
            color="primary"
            variant="outlined"
          />
        </Box>
      </FormSection>

      <FormSection>
        <Box direction="col" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Gender Identity"
            options={GENDER_OPTIONS}
            value={form.gender_type}
            onChange={(e) => setField('gender_type', e.target.value as GenderSelection | '')}
            color="primary"
            variant="outlined"
            placeholder="Select gender"
          />
          {form.gender_type === 'Other' && (
            <Input
              label="Custom Gender"
              placeholder="Describe your gender identity"
              value={form.gender_custom}
              onChange={(e) => setField('gender_custom', e.target.value)}
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
      </FormSection>

      <FormSection>
        <Textarea
          label="Bio"
          placeholder="Write a short bio…"
          value={form.bio}
          onChange={(e) => setField('bio', e.target.value)}
          color="primary"
          variant="outlined"
          rows={4}
          resize="vertical"
          showCharCount
          maxLength={500}
        />
      </FormSection>

      <FormSection>
        <Box direction="col" gap="4">
          <Input
            label="Street Address"
            placeholder="123 Main St"
            value={form.street}
            onChange={(e) => setField('street', e.target.value)}
            color="primary"
            variant="outlined"
          />
          <Box direction="col" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="New York"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              color="primary"
              variant="outlined"
            />
            <Input
              label="State / Province"
              placeholder="NY"
              value={form.state}
              onChange={(e) => setField('state', e.target.value)}
              color="primary"
              variant="outlined"
            />
          </Box>
          <Box direction="col" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ZIP / Postal Code"
              placeholder="10001"
              value={form.zip}
              onChange={(e) => setField('zip', e.target.value)}
              color="primary"
              variant="outlined"
            />
            <Input
              label="Country"
              placeholder="United States"
              value={form.country}
              onChange={(e) => setField('country', e.target.value)}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
      </FormSection>

      <Box
        direction="row"
        justify="between"
        align="center"
        gap="4"
        className="pt-4 border-t border-on-surface/10"
      >
        <Box direction="row" align="center">
          {successMsg && (
            <Text size="sm" weight="medium" color="success">{successMsg}</Text>
          )}
          {isError && (
            <Text size="sm" weight="medium" color="danger">
              {(error as any)?.data?.message ?? 'Something went wrong. Please try again.'}
            </Text>
          )}
        </Box>
        <Button
          variant="filled"
          color="primary"
          size="base"
          disabled={!isDirty || isSaving}
          onClick={handleSubmit}
        >
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};