import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

type Variant = keyof ReturnType<typeof useTheme>['theme']['colors'];

type TextAlign = 'left' | 'center' | 'right' | 'justify';
type TextDecoration = 'none' | 'underline' | 'line-through' | 'overline';
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: number | string; 
  weight?: number | 'normal' | 'bold' | 'bolder' | 'lighter';
  align?: TextAlign;
  decoration?: TextDecoration;
  transform?: TextTransform;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  nowrap?: boolean;
  truncate?: boolean;
  width?: number | string;
  height?: number | string;

  bg?: keyof ThemeColorUsage;
  text?: keyof ThemeColorUsage;
  children: string;
}

type ThemeColorUsage = {
  bg: string;
  text: string;
  border: string;
  hover: string;
  active: string;
  subtle: string;
};

export const Text: React.FC<TextProps> = ({
  variant = 'neutral',
  size,
  weight,
  align = 'left',
  decoration = 'none',
  transform = 'none',
  lineHeight,
  letterSpacing,
  nowrap = false,
  truncate = false,
  width,
  height,
  className,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const slot = theme.colors[variant];

  return (
    <span
      className={className}
      style={{
        color: slot.text,
        backgroundColor: slot.bg,
        fontSize: size,
        fontWeight: weight,
        textAlign: align,
        textDecoration: decoration,
        textTransform: transform,
        lineHeight,
        letterSpacing,
        whiteSpace: nowrap ? 'nowrap' : undefined,
        overflow: truncate ? 'hidden' : undefined,
        textOverflow: truncate ? 'ellipsis' : undefined,
        width,
        height,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};
