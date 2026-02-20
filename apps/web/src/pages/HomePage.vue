<script setup lang="ts">
import { IBox, IText, IButton } from '@inithium/ui';
</script>

<template>
  <IBox style="text-align: center; padding: 4rem 0">
    <IText as="h1" size="4xl" weight="bold" style="margin-bottom: 1rem"
      >Welcome to Inithium</IText
    >
    <IText color="secondary" size="lg" style="margin-bottom: 2rem">
      A fully-featured, scalable monorepo starter for modern web applications.
    </IText>
    <RouterLink :to="{ name: 'Register' }">
      <IButton size="lg">Get started</IButton>
    </RouterLink>
  </IBox>
</template>
