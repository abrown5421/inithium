<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../theme/ThemeProvider';

type Variant = 'solid' | 'outline' | 'ghost';
type Intent = 'primary' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    intent?: Intent;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
  }>(),
  {
    variant: 'solid',
    intent: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
  }
);

const emit = defineEmits<{ click: [e: MouseEvent] }>();

const { theme } = useTheme();

const style = computed(() => {
  const t = theme.value;
  const col = t.colors[props.intent];

  const sizeMap: Record<Size, { padding: string; fontSize: string }> = {
    sm: { padding: `${t.spacing[1]} ${t.spacing[3]}`, fontSize: t.fontSize.sm },
    md: {
      padding: `${t.spacing[2]} ${t.spacing[4]}`,
      fontSize: t.fontSize.base,
    },
    lg: { padding: `${t.spacing[3]} ${t.spacing[6]}`, fontSize: t.fontSize.lg },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[2],
    borderRadius: t.borderRadius.md,
    fontWeight: t.fontWeight.medium,
    fontFamily: t.fontFamily.sans,
    cursor: props.disabled || props.loading ? 'not-allowed' : 'pointer',
    opacity: props.disabled || props.loading ? '0.6' : '1',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
    width: props.fullWidth ? '100%' : 'auto',
    border: '1px solid transparent',
    ...sizeMap[props.size],
  };

  if (props.variant === 'solid') {
    return {
      ...base,
      backgroundColor: col.bg,
      color: col.fg,
      borderColor: col.bg,
    };
  }
  if (props.variant === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: col.bg,
      borderColor: col.bg,
    };
  }
  // ghost
  return {
    ...base,
    backgroundColor: 'transparent',
    color: col.bg,
    borderColor: 'transparent',
  };
});

function handleClick(e: MouseEvent) {
  if (!props.disabled && !props.loading) emit('click', e);
}
</script>

<template>
  <button :style="style" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading">⏳</span>
    <slot />
  </button>
</template>
