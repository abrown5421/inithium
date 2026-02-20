<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../theme/ThemeProvider';
import type { Spacing, BorderRadius, Shadow } from '../theme/tokens';

type Surface =
  | 'surface'
  | 'surfaceAlt'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const props = withDefaults(
  defineProps<{
    as?: string;
    surface?: Surface;
    p?: Spacing;
    px?: Spacing;
    py?: Spacing;
    pt?: Spacing;
    pb?: Spacing;
    pl?: Spacing;
    pr?: Spacing;
    m?: Spacing;
    mx?: Spacing;
    my?: Spacing;
    radius?: BorderRadius;
    shadow?: Shadow;
    border?: boolean;
    fullWidth?: boolean;
  }>(),
  {
    as: 'div',
    surface: 'surface',
    radius: 'none',
    shadow: 'none',
    border: false,
    fullWidth: false,
  }
);

const { theme } = useTheme();

const style = computed(() => {
  const t = theme.value;
  const s = t.colors[props.surface];
  const sp = t.spacing;

  return {
    backgroundColor: s.bg,
    color: s.fg,
    borderRadius: t.borderRadius[props.radius],
    boxShadow: t.shadow[props.shadow],
    ...(props.border ? { border: `1px solid ${s.border}` } : {}),
    ...(props.p !== undefined ? { padding: sp[props.p] } : {}),
    ...(props.px !== undefined
      ? { paddingLeft: sp[props.px], paddingRight: sp[props.px] }
      : {}),
    ...(props.py !== undefined
      ? { paddingTop: sp[props.py], paddingBottom: sp[props.py] }
      : {}),
    ...(props.pt !== undefined ? { paddingTop: sp[props.pt] } : {}),
    ...(props.pb !== undefined ? { paddingBottom: sp[props.pb] } : {}),
    ...(props.pl !== undefined ? { paddingLeft: sp[props.pl] } : {}),
    ...(props.pr !== undefined ? { paddingRight: sp[props.pr] } : {}),
    ...(props.m !== undefined ? { margin: sp[props.m] } : {}),
    ...(props.mx !== undefined
      ? { marginLeft: sp[props.mx], marginRight: sp[props.mx] }
      : {}),
    ...(props.my !== undefined
      ? { marginTop: sp[props.my], marginBottom: sp[props.my] }
      : {}),
    ...(props.fullWidth ? { width: '100%' } : {}),
  };
});
</script>

<template>
  <component :is="as" :style="style">
    <slot />
  </component>
</template>
