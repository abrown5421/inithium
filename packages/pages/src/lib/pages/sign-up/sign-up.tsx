import React, { useState } from 'react';
import { Box } from '@inithium/ui';
import { Input } from '@inithium/ui';
import { Button } from '@inithium/ui';
import { Icon } from '@inithium/ui';
import { Text } from '@inithium/ui';
import { usePageTransition } from '@inithium/store';
import { router } from '@inithium/router';

const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required.';
  if (!email.includes('@') || !email.includes('.'))
    return "That email doesn't look right — please check and try again.";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
};

const validateConfirmPassword = (password: string, confirm: string): string | null => {
  const baseErr = validatePassword(confirm);
  if (baseErr) return baseErr;
  if (password !== confirm) return 'Passwords do not match.';
  return null;
};

export const SignUp: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const { controller } = usePageTransition();

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value);
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  const handleSubmit = () => {
    const fnErr = firstName.trim() === '' ? 'First name is required.' : null;
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cpErr = validateConfirmPassword(password, confirmPassword);

    setFirstNameError(fnErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (!fnErr && !eErr && !pErr && !cpErr) {
      console.log('Sign up submitted', { firstName, lastName, email, password });
    }
  };

  const handleSignInClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate('/auth/login');
  };

  return (
    <Box
      as="section"
      display="flex"
      direction="col"
      align="center"
      justify="center"
      fullWidth
      fullHeight
    >
      <Box
        as="div"
        display="flex"
        direction="col"
        gap="6"
        bg="surface"
        color="surface-contrast"
        rounded="2xl"
        p="8"
        className="w-[95vw] md:w-1/3 shadow-xl"
      >
        <Box direction="col" gap="1">
          <Text size="lg" weight="bold" color="surface2-contrast" font="display">
            Create an account
          </Text>
        </Box>

        <Box direction="col" gap="4">
          <Box direction="row" gap="3">
            <Input
              label="First Name"
              type="text"
              placeholder="Jane"
              value={firstName}
              onChange={handleFirstNameChange}
              invalid={!!firstNameError}
              error={firstNameError ?? undefined}
              className="flex-1"
            />
            <Input
              label="Last Name"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={handleLastNameChange}
              className="flex-1"
            />
          </Box>

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            invalid={!!emailError}
            error={emailError ?? undefined}
            leadingIcon={<Icon name="EnvelopeIcon" size="sm" />}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            invalid={!!passwordError}
            error={passwordError ?? undefined}
            leadingIcon={<Icon name="LockClosedIcon" size="sm" />}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="pointer-events-auto cursor-pointer opacity-60 hover:opacity-100 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size="sm" />
              </button>
            }
          />

          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            invalid={!!confirmPasswordError}
            error={confirmPasswordError ?? undefined}
            leadingIcon={<Icon name="LockClosedIcon" size="sm" />}
            trailingIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="pointer-events-auto cursor-pointer opacity-60 hover:opacity-100 transition"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size="sm" />
              </button>
            }
          />
        </Box>

        <Button
          variant="filled"
          color="primary"
          size="base"
          className="w-full justify-center"
          onClick={handleSubmit}
        >
          Create Account
        </Button>

        <p className="text-xs text-center opacity-50">
          Already have an account?{' '}
          <a
            href="/auth/login"
            onClick={handleSignInClick}
            className="underline opacity-100 hover:opacity-80 transition"
          >
            Sign in
          </a>
        </p>
      </Box>
    </Box>
  );
};

export default SignUp;