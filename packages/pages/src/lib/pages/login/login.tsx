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

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { controller } = usePageTransition();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (!eErr && !pErr) {
      console.log('Login submitted', { email, password });
    }
  };

  const handleSignUpClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate('/auth/signup');
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
            Welcome back
          </Text>
        </Box>

        <Box direction="col" gap="4">
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
        </Box>

        <Button
          variant="filled"
          color="primary"
          size="base"
          className="w-full justify-center"
          onClick={handleSubmit}
        >
          Sign In
        </Button>

        <p className="text-xs text-center opacity-50">
          Don't have an account?{' '}
          <a
            href="/auth/signup"
            onClick={handleSignUpClick}
            className="underline opacity-100 hover:opacity-80 transition"
          >
            Create one
          </a>
        </p>
      </Box>
    </Box>
  );
};

export default Login;