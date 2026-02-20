<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@inithium/auth';
import { IBox, IText, IInput, IButton } from '@inithium/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const { login, loading, error } = useAuth(API_URL);
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');

async function handleSubmit() {
  const result = await login({ email: email.value, password: password.value });
  if (result.success) {
    const redirect = route.query.redirect as string | undefined;
    router.push(redirect ?? { name: 'Dashboard' });
  }
}
</script>

<template>
  <IBox
    surface="surface"
    radius="xl"
    shadow="lg"
    style="width: 100%; max-width: 24rem"
  >
    <IText as="h1" size="2xl" weight="bold" style="margin-bottom: 1.5rem"
      >Sign in</IText
    >

    <div style="display: flex; flex-direction: column; gap: 1rem">
      <IInput
        v-model="email"
        id="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        required
      />
      <IInput
        v-model="password"
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        required
      />

      <IText v-if="error" color="danger" size="sm">{{ error }}</IText>

      <IButton
        intent="primary"
        size="md"
        :loading="loading"
        full-width
        @click="handleSubmit"
      >
        Sign in
      </IButton>
    </div>

    <IText
      size="sm"
      color="secondary"
      style="margin-top: 1rem; text-align: center"
    >
      Don't have an account?
      <RouterLink :to="{ name: 'Register' }">
        <IText as="span" color="brand" size="sm">Sign up</IText>
      </RouterLink>
    </IText>
  </IBox>
</template>
