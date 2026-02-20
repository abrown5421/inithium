<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ThemeProvider } from '@inithium/ui';
import { useAuth } from '@inithium/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const savedMode =
  (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light';
const initialMode = ref(savedMode);

const { initializeAuth } = useAuth(API_URL);

onMounted(async () => {
  await initializeAuth();
});
</script>

<template>
  <ThemeProvider :initial-mode="initialMode">
    <RouterView />
  </ThemeProvider>
</template>
