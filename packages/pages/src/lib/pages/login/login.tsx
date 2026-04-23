import React, { useState, useCallback } from "react";
import { Box, Input, Text, Button, Icon } from "@inithium/ui";
import { usePageTransition } from "@inithium/store";
import { router } from '@inithium/router';

interface LoginProps {
  onNavigate: (path: string) => void;
  onSubmit?: (email: string, password: string) => Promise<void> | void;
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

const Login: React.FC<LoginProps> = ({ onNavigate, onSubmit }) => {
  const { controller } = usePageTransition();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    };

  const validate = useCallback((): boolean => {
    const next = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return !next.email && !next.password;
  }, [form]);

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.(form.email, form.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePage = async (e: React.MouseEvent) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate('/auth/signup');
  };

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

      <Input
        label="Email Address"
        type="email"
        value={form.email}
        onChange={updateField("email")}
        error={errors.email}
        invalid={!!errors.email}
        placeholder="you@example.com"
      />

      <Input
        label="Password"
        type={showPassword ? "text" : "password"}
        value={form.password}
        onChange={updateField("password")}
        error={errors.password}
        invalid={!!errors.password}
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

      <Button onClick={handleSubmit} disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Signing in…" : "Sign In"}
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