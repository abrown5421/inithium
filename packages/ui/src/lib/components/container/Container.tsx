import React from 'react';
import { useTheme } from '../../theme/ThemeProvider';

type Variant = keyof ReturnType<typeof useTheme>['theme']['colors'];

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type JustifyContent =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

type AlignItems = 'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline';

type ThemeColorUsage = {
  bg: string;
  text: string;
  border: string;
  hover: string;
  active: string;
  subtle: string;
};

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  flex?: boolean;
  direction?: FlexDirection;
  justify?: JustifyContent;
  align?: AlignItems;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  padding?: number | string;
  margin?: number | string;
  border?: boolean | string;
  borderWidth?: number | string;
  borderRadius?: number | string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  bg?: keyof ThemeColorUsage;
  text?: keyof ThemeColorUsage;
}

export const Container: React.FC<ContainerProps> = ({
  variant = 'neutral',
  flex = false,
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  padding,
  margin,
  border,
  borderWidth,
  borderRadius,
  overflow,
  bg,
  text,
  className,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const slot = theme.colors[variant];
  const computedBorder =
    border === true ? '1px solid' :
    typeof border === 'string' ? border :
    undefined;
  return (
    <div
      className={className}
      style={{
        backgroundColor: bg ? slot[bg] : slot.bg,
        color: text ? slot[text] : slot.text,
        borderColor: slot.border,
        display: flex ? 'flex' : undefined,
        flexDirection: flex ? direction : undefined,
        justifyContent: flex ? justify : undefined,
        alignItems: flex ? align : undefined,
        flexWrap: flex ? wrap : undefined,
        gap: flex ? gap : undefined,
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
        padding,
        margin,
        border: computedBorder,
        borderWidth,
        borderRadius,
        overflow,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};