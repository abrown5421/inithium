import React, { useState, useCallback } from "react";
import { Box, Input, Text, Button, Icon, Loader } from "@inithium/ui";
import { usePageTransition } from "@inithium/store";
import { router } from "@inithium/router";
import { useLoginMutation } from "@inithium/store";

interface LoginProps {
  onSuccess?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_CRITERIA = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/];

const validateEmail = (val: string) => {
  if (!val) return "Email is required";
  if (!EMAIL_RE.test(val)) return "Email appears malformatted";
  return "";
};

const validatePassword = (val: string) => {
  if (val.length < 8) return "Password must have at least 8 characters";
  if (!PASSWORD_CRITERIA.every((re) => re.test(val)))
    return "Password must have an upper/lower case letter, a number, and a special character";
  return "";
};

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { controller } = usePageTransition();
  const [login, { isLoading, error }] = useLoginMutation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const updateField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = (e.target as HTMLInputElement).value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    };

  const validate = useCallback((): boolean => {
    const next = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setFieldErrors(next);
    return !next.email && !next.password;
  }, [form]);

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await login({ email: form.email, password: form.password }).unwrap();
      onSuccess?.();
    } catch {
      // Server error is surfaced via the `error` value from the mutation hook;
      // no extra handling needed here unless you want a toast etc.
    }
  };

  const handleTogglePage = async (e: React.MouseEvent) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate("/auth/signup");
  };

  // Derive a human-readable server error message
  const serverError = error
    ? "data" in error
      ? (error.data as { message?: string })?.message ?? "Login failed. Please try again."
      : "Login failed. Please try again."
    : null;

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
      <Text
        size="lg"
        weight="bold"
        color="surface2-contrast"
        font="display"
        className="text-center"
      >
        Login
      </Text>

      {serverError && (
        <Text size="sm" className="text-center text-red-500">
          {serverError}
        </Text>
      )}

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
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={togglePassword}
            className="focus:outline-none cursor-pointer z-10"
          >
            <Icon
              name={showPassword ? "EyeSlashIcon" : "EyeIcon"}
              iconStyle="solid-20"
              size="sm"
            />
          </button>
        }
      />

      <Button onClick={handleSubmit} disabled={isLoading} className="mt-2">
        {isLoading ? <Loader size={18} color="primary-contrast" variant="dots" /> : "Sign In"}
      </Button>

      <div className="mt-4 text-center">
        <Text size="sm">
          Don't have an account?{" "}
          <button
            onClick={handleTogglePage}
            className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Sign up
          </button>
        </Text>
      </div>
    </Box>
  );
};

export default Login;