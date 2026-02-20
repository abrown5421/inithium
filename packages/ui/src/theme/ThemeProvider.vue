<script setup lang="ts">
import { provideTheme } from './ThemeProvider';

const props = withDefaults(
  defineProps<{
    initialMode?: 'light' | 'dark';
  }>(),
  {
    initialMode: 'light',
  }
);

provideTheme(props.initialMode);
</script>

<template>
  <slot />
</template>
