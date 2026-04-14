    // radio-group.types.ts
    import type { ThemeColor, ComponentSize } from '@inithium/types';
    import type { IconName } from '../icon/icon.types'; // Adjust path as needed

    export type RadioGroupVariant = 'filled' | 'outlined' | 'ghost';
    export type RadioGroupOrientation = 'horizontal' | 'vertical';

    export interface RadioOption {
    label: React.ReactNode;
    value: string;
    iconName: IconName;
    description?: React.ReactNode;
    disabled?: boolean;
    }

    export interface RadioGroupProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    variant?: RadioGroupVariant;
    orientation?: RadioGroupOrientation;
    size?: ComponentSize;
    color?: ThemeColor;
    label?: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    optionClassName?: string;
    radioClassName?: string;
    optionLabelClassName?: string;
    optionDescriptionClassName?: string;
    disabled?: boolean;
    name?: string;
    }