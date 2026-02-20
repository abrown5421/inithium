<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import IText from './IText.vue';
import { useTheme } from '../theme/ThemeProvider';
import { computed } from 'vue';

defineProps<{
  title: string;
  defaultOpen?: boolean;
}>();

const { theme } = useTheme();

const buttonStyle = computed(() => ({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${theme.value.spacing[3]} ${theme.value.spacing[4]}`,
  backgroundColor: theme.value.colors.surface.subtle,
  border: `1px solid ${theme.value.colors.surface.border}`,
  borderRadius: theme.value.borderRadius.md,
  cursor: 'pointer',
}));
</script>

<template>
  <Disclosure v-slot="{ open }" :default-open="defaultOpen">
    <DisclosureButton :style="buttonStyle">
      <IText weight="medium">{{ title }}</IText>
      <span>{{ open ? '▲' : '▼' }}</span>
    </DisclosureButton>
    <DisclosurePanel>
      <slot />
    </DisclosurePanel>
  </Disclosure>
</template>
