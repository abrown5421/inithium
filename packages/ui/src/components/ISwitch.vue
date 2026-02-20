<script setup lang="ts">
import { Switch } from '@headlessui/vue';
import { useTheme } from '../theme/ThemeProvider';
import { computed } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  label?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const { theme } = useTheme();

const trackStyle = computed(() => ({
  position: 'relative' as const,
  display: 'inline-flex',
  height: '1.5rem',
  width: '2.75rem',
  borderRadius: '9999px',
  backgroundColor: props.modelValue
    ? theme.value.colors.primary.bg
    : theme.value.colors.surface.border,
  transition: 'background-color 0.2s',
  cursor: 'pointer',
  border: 'none',
  padding: '2px',
}));

const thumbStyle = computed(() => ({
  display: 'inline-block',
  height: '1.25rem',
  width: '1.25rem',
  borderRadius: '9999px',
  backgroundColor: '#fff',
  boxShadow: theme.value.shadow.sm,
  transform: props.modelValue ? 'translateX(1.25rem)' : 'translateX(0)',
  transition: 'transform 0.2s',
}));
</script>

<template>
  <div style="display: flex; align-items: center; gap: 0.5rem">
    <Switch
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
      :style="trackStyle"
    >
      <span :style="thumbStyle" />
    </Switch>
    <span
      v-if="label"
      :style="{ color: theme.colors.text.primary, fontSize: theme.fontSize.sm }"
      >{{ label }}</span
    >
  </div>
</template>
