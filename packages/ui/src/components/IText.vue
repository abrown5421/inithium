<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../theme/ThemeProvider';
import type { FontSize, FontWeight, FontFamily } from '../theme/tokens';

type TextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'inverse'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const props = withDefaults(
  defineProps<{
    as?: string;
    size?: FontSize;
    weight?: FontWeight;
    family?: FontFamily;
    color?: TextColor;
    truncate?: boolean;
  }>(),
  {
    as: 'span',
    size: 'base',
    weight: 'normal',
    family: 'sans',
    color: 'primary',
    truncate: false,
  }
);

const { theme } = useTheme();

const style = computed(() => {
  const t = theme.value;
  const colorMap: Record<TextColor, string> = {
    primary: t.colors.text.primary,
    secondary: t.colors.text.secondary,
    disabled: t.colors.text.disabled,
    inverse: t.colors.text.inverse,
    brand: t.colors.primary.bg,
    success: t.colors.success.bg,
    warning: t.colors.warning.bg,
    danger: t.colors.danger.bg,
    info: t.colors.info.bg,
  };

  return {
    color: colorMap[props.color],
    fontSize: t.fontSize[props.size],
    fontWeight: t.fontWeight[props.weight],
    fontFamily: t.fontFamily[props.family],
    ...(props.truncate
      ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }
      : {}),
  };
});
</script>

<template>
  <component :is="as" :style="style">
    <slot />
  </component>
</template>
