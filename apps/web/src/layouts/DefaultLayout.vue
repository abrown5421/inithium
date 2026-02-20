<script setup lang="ts">
import { IBox, IText, IButton, useTheme } from '@inithium/ui';
import { useAuth } from '@inithium/auth';
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const { user, isAuthenticated, logout } = useAuth(API_URL);
const { isDark, toggleMode } = useTheme();
const router = useRouter();

async function handleLogout() {
  await logout();
  router.push({ name: 'Login' });
}
</script>

<template>
  <IBox
    as="div"
    surface="surface"
    style="min-height: 100vh; display: flex; flex-direction: column"
  >
    <IBox
      as="nav"
      surface="surfaceAlt"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <IText as="span" size="xl" weight="bold" color="brand">Inithium</IText>
      <div style="display: flex; align-items: center; gap: 1rem">
        <IButton variant="ghost" size="sm" @click="toggleMode">
          {{ isDark ? '☀️' : '🌙' }}
        </IButton>
        <template v-if="isAuthenticated">
          <IText size="sm" color="secondary">{{ user?.displayName }}</IText>
          <IButton
            variant="outline"
            size="sm"
            intent="danger"
            @click="handleLogout"
            >Logout</IButton
          >
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'Login' }">
            <IButton variant="outline" size="sm">Log in</IButton>
          </RouterLink>
          <RouterLink :to="{ name: 'Register' }">
            <IButton variant="solid" size="sm">Sign up</IButton>
          </RouterLink>
        </template>
      </div>
    </IBox>

    <IBox as="main" style="flex: 1">
      <RouterView />
    </IBox>
  </IBox>
</template>
