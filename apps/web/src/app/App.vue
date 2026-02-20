<script setup lang="ts">
import { ThemeProvider } from '@inithium/ui';
import { ref } from 'vue';

const savedMode =
  (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light';
const initialMode = ref(savedMode);
</script>

<template>
  <ThemeProvider :initial-mode="initialMode">
    <RouterView />
  </ThemeProvider>
</template>
