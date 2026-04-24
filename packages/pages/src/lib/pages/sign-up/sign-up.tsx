import React, { useState, useCallback } from "react";
import { Box, Input, Text, Button, Icon } from "@inithium/ui";
import { usePageTransition } from "@inithium/store";
import { router } from "@inithium/router";

interface SignUpProps {
  onSubmit?: (data: Record<string, string>) => Promise<void> | void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_CRITERIA = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>]/];

const validators = {
  firstName: (val: string) => (!val ? "First name is required" : ""),
  email: (val: string) => 
    !val ? "Email is required" : !EMAIL_RE.test(val) ? "Email appears malformatted" : "",
  password: (val: string) => 
    val.length < 8 ? "Password must have at least 8 characters" : 
    !PASSWORD_CRITERIA.every((re) => re.test(val)) ? "Requires: A-z, 0-9, & symbol" : "",
  confirmPassword: (val: string, match: string) => 
    val !== match ? "Passwords do not match" : ""
};

const SignUp: React.FC<SignUpProps> = ({ onSubmit }) => {
  const { controller } = usePageTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  
  const [errors, setErrors] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });

  const updateField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
  };

  const validate = useCallback((): boolean => {
    const next = {
      firstName: validators.firstName(form.firstName),
      lastName: "",
      email: validators.email(form.email),
      password: validators.password(form.password),
      confirmPassword: validators.confirmPassword(form.confirmPassword, form.password),
    };
    setErrors(next);
    return Object.values(next).every(err => !err);
  }, [form]);

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePage = async (e: React.MouseEvent) => {
    e.preventDefault();
    await controller.triggerExit();
    router.navigate('/auth/login');
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
        Create Account
      </Text>

      <Box direction="row" gap="4" fullWidth>
        <Box flex> 
          <Input
            label="First Name"
            fullWidth
            value={form.firstName}
            onChange={updateField("firstName")}
            error={errors.firstName}
            invalid={!!errors.firstName}
            placeholder="Jane"
          />
        </Box>

        <Box flex>
          <Input
            label="Last Name (Optional)"
            fullWidth
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

      <Input
        label="Confirm Password"
        type={showPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
        error={errors.confirmPassword}
        invalid={!!errors.confirmPassword}
        placeholder="••••••••"
      />

      <Button onClick={handleSubmit} disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Creating Account…" : "Register"}
      </Button>

      <div className="mt-4 text-center">
        <Text size="sm">
          Already have an account?{" "}
          <button
            onClick={handleTogglePage}
            className="text-primary font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Sign in
          </button>
        </Text>
      </div>
    </Box>
  );
};

export default SignUp;