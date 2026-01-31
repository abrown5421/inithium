import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

type Variant = keyof ReturnType<typeof useTheme>['theme']['colors'];

type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'neutral',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  className,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const slot = theme.colors[variant];

  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    small: {
      padding: '4px 10px',
      fontSize: '0.75rem',
    },
    medium: {
      padding: '6px 16px',
      fontSize: '0.875rem',
    },
    large: {
      padding: '8px 22px',
      fontSize: '1rem',
    },
  };

  const backgroundColor = disabled
    ? slot.subtle
    : active
      ? slot.active
      : hovered
        ? slot.hover
        : slot.bg;

  return (
    <button
      className={className}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        backgroundColor,
        color: slot.text,
        border: `1px solid ${slot.border}`,
        borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.6 : 1,
        transition: 'background-color 150ms ease, border-color 150ms ease',
        userSelect: 'none',
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {startIcon && <span style={{ display: 'inline-flex' }}>{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span style={{ display: 'inline-flex' }}>{endIcon}</span>}
    </button>
  );
};
