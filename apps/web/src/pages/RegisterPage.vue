<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@inithium/auth';
import { IBox, IText, IInput, IButton } from '@inithium/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const { register, loading, error } = useAuth(API_URL);
const router = useRouter();

const displayName = ref('');
const email = ref('');
const password = ref('');

async function handleSubmit() {
  const result = await register({
    displayName: displayName.value,
    email: email.value,
    password: password.value,
  });
  if (result.success) router.push({ name: 'Dashboard' });
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
      >Create account</IText
    >

    <div style="display: flex; flex-direction: column; gap: 1rem">
      <IInput
        v-model="displayName"
        id="name"
        type="text"
        label="Display Name"
        placeholder="Jane Smith"
        required
      />
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
        placeholder="Min 8 characters"
        required
        hint="Uppercase, lowercase, and a number required"
      />

      <IText v-if="error" color="danger" size="sm">{{ error }}</IText>

      <IButton
        intent="primary"
        size="md"
        :loading="loading"
        full-width
        @click="handleSubmit"
      >
        Create account
      </IButton>
    </div>

    <IText
      size="sm"
      color="secondary"
      style="margin-top: 1rem; text-align: center"
    >
      Already have an account?
      <RouterLink :to="{ name: 'Login' }">
        <IText as="span" color="brand" size="sm">Sign in</IText>
      </RouterLink>
    </IText>
  </IBox>
</template>
