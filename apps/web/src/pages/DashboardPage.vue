<script setup lang="ts">
import { useAuth } from '@inithium/auth';
import { IBox, IText } from '@inithium/ui';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const { user } = useAuth(API_URL);
</script>

<template>
  <IBox>
    <IText as="h1" size="3xl" weight="bold">Dashboard</IText>
    <IText color="secondary" style="margin-top: 0.5rem"
      >Welcome back, {{ user?.displayName }}!</IText
    >
  </IBox>
</template>
