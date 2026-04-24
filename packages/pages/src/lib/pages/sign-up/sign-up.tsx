import React, { useState, useCallback, useEffect } from "react";
import { Box, Input, Text, Button, Icon, Loader } from "@inithium/ui";
import { usePageTransition } from "@inithium/store";
import { router } from "@inithium/router";
import { useRegisterMutation } from "@inithium/store";
import { useCurrentUser } from "@inithium/store"; 

interface SignUpProps {
  onSuccess?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_CRITERIA = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/];

const validators = {
  firstName: (val: string) => (!val ? "First name is required" : ""),
  email: (val: string) =>
    !val
      ? "Email is required"
      : !EMAIL_RE.test(val)
      ? "Email appears malformatted"
      : "",
  password: (val: string) =>
    val.length < 8
      ? "Password must have at least 8 characters"
      : !PASSWORD_CRITERIA.every((re) => re.test(val))
      ? "Requires: A-z, 0-9, & symbol"
      : "",
  confirmPassword: (val: string, match: string) =>
    val !== match ? "Passwords do not match" : "",
};

const SignUp: React.FC<SignUpProps> = ({ onSuccess }) => {
  const { controller } = usePageTransition();
  const [register, { isLoading: isRegistering, error }] = useRegisterMutation();
  const { refetch, isLoading: isFetchingUser } = useCurrentUser();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const updateField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    };

  const validate = useCallback((): boolean => {
    const next = {
      firstName: validators.firstName(form.firstName),
      lastName: "",
      email: validators.email(form.email),
      password: validators.password(form.password),
      confirmPassword: validators.confirmPassword(
        form.confirmPassword,
        form.password
      ),
    };
    setFieldErrors(next);
    return Object.values(next).every((err) => !err);
  }, [form]);

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      }).unwrap();
      
      refetch();
      onSuccess?.();
    } catch {
      // Error handled by RTK Query state
    }
  };

  const handleTogglePage = async (e: React.MouseEvent) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate("/auth/login");
  };

  const serverError = error
    ? "data" in error
      ? (error.data as { message?: string })?.message ?? "Registration failed."
      : "Registration failed."
    : null;

  const isPending = isRegistering || isFetchingUser;

  return (
    <Box
      p="4"
      gap="4"
      bg="surface"
      color="surface-contrast"
      rounded="md"
      direction="col"
      className="w-[95vw] md:w-1/3"
    >
      <Text size="lg" weight="bold" color="surface2-contrast" font="display" className="text-center">
        Create Account
      </Text>

      {serverError && (
        <Text size="sm" className="text-center text-red-500">
          {serverError}
        </Text>
      )}

      <Box direction="row" gap="4" fullWidth>
        <Box flex>
          <Input
            label="First Name"
            value={form.firstName}
            onChange={updateField("firstName")}
            error={fieldErrors.firstName}
            invalid={!!fieldErrors.firstName}
            placeholder="Jane"
          />
        </Box>
        <Box flex>
          <Input
            label="Last Name (Optional)"
            value={form.lastName}
            onChange={updateField("lastName")}
            placeholder="Doe"
          />
        </Box>
      </Box>

      <Input
        label="Email Address"
        type="email"
        value={form.email}
        onChange={updateField("email")}
        error={fieldErrors.email}
        invalid={!!fieldErrors.email}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        value={form.password}
        onChange={updateField("password")}
        error={fieldErrors.password}
        invalid={!!fieldErrors.password}
        placeholder="••••••••"
        trailingIcon={
          <button type="button" onClick={togglePassword} className="focus:outline-none cursor-pointer z-10">
            <Icon name={showPassword ? "EyeSlashIcon" : "EyeIcon"} iconStyle="solid-20" size="sm" />
          </button>
        }
      />

      <Input
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
        error={fieldErrors.confirmPassword}
        invalid={!!fieldErrors.confirmPassword}
        placeholder="••••••••"
      />

      <Button onClick={handleSubmit} disabled={isPending} className="mt-2">
        {isPending ? <Loader size={18} color="primary-contrast" variant="dots" /> : "Register"}
      </Button>

      <div className="mt-4 text-center">
        <Text size="sm">
          Already have an account?{" "}
          <button onClick={handleTogglePage} className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">
            Sign in
          </button>
        </Text>
      </div>
    </Box>
  );
};

export default SignUp;