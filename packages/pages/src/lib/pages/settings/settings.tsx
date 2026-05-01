import React, { useState, useCallback } from 'react';
import { Box, Input, Text, Button, Icon, Loader } from '@inithium/ui';
import { useCurrentUser, useUpdateOneMutation, useUpdateMeMutation, useChangePasswordMutation } from '@inithium/store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_CRITERIA = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/];

const validateEmail = (val: string) => {
  if (!val) return 'Email is required';
  if (!EMAIL_RE.test(val)) return 'Email appears malformatted';
  return '';
};

const validatePassword = (val: string) => {
  if (!val) return 'Password is required';
  if (val.length < 8) return 'Password must have at least 8 characters';
  if (!PASSWORD_CRITERIA.every((re) => re.test(val)))
    return 'Requires: A–Z, a–z, 0–9, & symbol';
  return '';
};

const EmailUpdateForm: React.FC<{ userId: string; currentEmail: string }> = ({
  userId,
  currentEmail,
}) => {
  const [updateOne, { isLoading, isError, error }] = useUpdateOneMutation();

  const [form, setForm] = useState({ currentEmail: '', newEmail: '' });
  const [fieldErrors, setFieldErrors] = useState({ currentEmail: '', newEmail: '' });
  const [successMsg, setSuccessMsg] = useState('');

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
    setSuccessMsg('');
  };

  const validate = useCallback((): boolean => {
    const next = {
      currentEmail: !form.currentEmail
        ? 'Current email is required'
        : form.currentEmail !== currentEmail
        ? 'Current email does not match our records'
        : '',
      newEmail: validateEmail(form.newEmail),
    };
    setFieldErrors(next);
    return Object.values(next).every((e) => !e);
  }, [form, currentEmail]);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await updateOne({ id: userId, patch: { email: form.newEmail } }).unwrap();
      setSuccessMsg('Email updated successfully.');
      setForm({ currentEmail: '', newEmail: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {}
  };

  const serverError = isError
    ? 'data' in (error ?? {})
      ? ((error as any)?.data?.message ?? 'Update failed. Please try again.')
      : 'Update failed. Please try again.'
    : null;

  return (
    <Box direction="col" gap="4" fullWidth>
      <Box direction="col" gap="1">
        <Text size="sm" weight="semibold" color="surface-contrast">
          Email Address
        </Text>
        <Text size="xs" color="surface2-contrast">
          Confirm your current email before setting a new one.
        </Text>
      </Box>

      <Box direction="col" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Current Email"
          type="email"
          placeholder="you@example.com"
          value={form.currentEmail}
          onChange={(e) => setField('currentEmail', e.target.value)}
          error={fieldErrors.currentEmail}
          invalid={!!fieldErrors.currentEmail}
          color="primary"
          variant="outlined"
        />
        <Input
          label="New Email"
          type="email"
          placeholder="new@example.com"
          value={form.newEmail}
          onChange={(e) => setField('newEmail', e.target.value)}
          error={fieldErrors.newEmail}
          invalid={!!fieldErrors.newEmail}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Box direction="row" justify="between" align="center" gap="4">
        <Box>
          {successMsg && (
            <Text size="sm" weight="medium" color="success">
              {successMsg}
            </Text>
          )}
          {serverError && (
            <Text size="sm" weight="medium" color="danger">
              {serverError}
            </Text>
          )}
        </Box>
        <Button
          variant="filled"
          color="primary"
          size="base"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? <Loader size={18} color="primary-contrast" variant="dots" /> : 'Update Email'}
        </Button>
      </Box>
    </Box>
  );
};

const PasswordUpdateForm: React.FC<{ userId: string }> = ({ userId }) => {
  const [changePassword, { isLoading, isError, error }] = useChangePasswordMutation();

  const [showPasswords, setShowPasswords] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [successMsg, setSuccessMsg] = useState('');

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev));
    setSuccessMsg('');
  };

  const validate = useCallback((): boolean => {
    const next = {
      currentPassword: !form.currentPassword ? 'Current password is required' : '',
      newPassword: validatePassword(form.newPassword),
      confirmPassword:
        form.newPassword !== form.confirmPassword ? 'Passwords do not match' : '',
    };
    setFieldErrors(next);
    return Object.values(next).every((e) => !e);
  }, [form]);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      setSuccessMsg('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {}
  };

  const serverError = isError
    ? 'data' in (error ?? {})
      ? ((error as any)?.data?.message ?? 'Update failed. Please try again.')
      : 'Update failed. Please try again.'
    : null;

  const passwordType = showPasswords ? 'text' : 'password';

  const ToggleIcon = (
    <div className="relative z-[100] flex items-center justify-center pointer-events-auto">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPasswords((p) => !p); }}
        className="focus:outline-none cursor-pointer p-1 hover:opacity-70 transition-opacity"
        aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
      >
        <Icon
          name={showPasswords ? 'EyeSlashIcon' : 'EyeIcon'}
          iconStyle="solid-20"
          size="sm"
        />
      </button>
    </div>
  );

  return (
    <Box direction="col" gap="4" fullWidth>
      <Box direction="col" gap="1">
        <Text size="sm" weight="semibold" color="surface-contrast">
          Password
        </Text>
        <Text size="xs" color="surface2-contrast">
          Confirm your current password before choosing a new one.
        </Text>
      </Box>

      <Input
        label="Current Password"
        type={passwordType}
        placeholder="••••••••"
        value={form.currentPassword}
        onChange={(e) => setField('currentPassword', e.target.value)}
        error={fieldErrors.currentPassword}
        invalid={!!fieldErrors.currentPassword}
        color="primary"
        variant="outlined"
        trailingIcon={ToggleIcon}
      />

      <Box direction="col" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="New Password"
          type={passwordType}
          placeholder="••••••••"
          value={form.newPassword}
          onChange={(e) => setField('newPassword', e.target.value)}
          error={fieldErrors.newPassword}
          invalid={!!fieldErrors.newPassword}
          color="primary"
          variant="outlined"
        />
        <Input
          label="Confirm New Password"
          type={passwordType}
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          error={fieldErrors.confirmPassword}
          invalid={!!fieldErrors.confirmPassword}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Box direction="row" justify="between" align="center" gap="4">
        <Box>
          {successMsg && (
            <Text size="sm" weight="medium" color="success">
              {successMsg}
            </Text>
          )}
          {serverError && (
            <Text size="sm" weight="medium" color="danger">
              {serverError}
            </Text>
          )}
        </Box>
        <Button
          variant="filled"
          color="primary"
          size="base"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? <Loader size={18} color="primary-contrast" variant="dots" /> : 'Update Password'}
        </Button>
      </Box>
    </Box>
  );
};

const Settings = () => {
  const { user: authUser } = useCurrentUser();

  if (!authUser) {
    return (
      <Box direction="col" justify="center" align="center" className="w-full h-full">
        <Loader size={58} color="primary" />
      </Box>
    );
  }

  return (
    <Box
      direction="col"
      fullWidth
      bg="surface"
      color="surface-contrast"
      className="h-shell"
    >
      <Box
        direction="col"
        gap="8"
        p="6"
        className="w-full lg:w-1/2 mx-auto"
      >
        <Box direction="col" gap="1">
          <Text size="xl" weight="bold" color="surface-contrast" font="display">
            Account Settings
          </Text>
          <Text size="sm" color="surface2-contrast">
            Manage your login credentials
          </Text>
        </Box>

        <Box
          direction="col"
          gap="4"
          p="4"
          bg="surface2"
          rounded="md"
          className="border border-on-surface/10"
        >
          <EmailUpdateForm userId={authUser._id} currentEmail={authUser.email} />
        </Box>

        <div className="border-t border-on-surface/10" />

        <Box
          direction="col"
          gap="4"
          p="4"
          bg="surface2"
          rounded="md"
          className="border border-on-surface/10"
        >
          <PasswordUpdateForm userId={authUser._id} />
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;