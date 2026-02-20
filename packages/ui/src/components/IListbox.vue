<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue';
import { useTheme } from '../theme/ThemeProvider';
import { computed } from 'vue';

export interface ListboxItem {
  value: string | number;
  label: string;
  disabled?: boolean;
}

const props = defineProps<{
  modelValue: ListboxItem | null;
  items: ListboxItem[];
  placeholder?: string;
  label?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [item: ListboxItem] }>();

const { theme } = useTheme();

const buttonStyle = computed(() => ({
  width: '100%',
  padding: `${theme.value.spacing[2]} ${theme.value.spacing[3]}`,
  border: `1px solid ${theme.value.colors.surface.border}`,
  borderRadius: theme.value.borderRadius.md,
  backgroundColor: theme.value.colors.surface.bg,
  color: props.modelValue
    ? theme.value.colors.text.primary
    : theme.value.colors.text.secondary,
  textAlign: 'left' as const,
  cursor: 'pointer',
  fontSize: theme.value.fontSize.base,
  display: 'flex',
  justifyContent: 'space-between',
}));

const optionsStyle = computed(() => ({
  position: 'absolute' as const,
  width: '100%',
  border: `1px solid ${theme.value.colors.surface.border}`,
  borderRadius: theme.value.borderRadius.md,
  boxShadow: theme.value.shadow.md,
  zIndex: '10',
  backgroundColor: theme.value.colors.surface.bg,
  padding: theme.value.spacing[1],
  marginTop: theme.value.spacing[1],
}));
</script>

<template>
  <div style="position: relative">
    <p
      v-if="label"
      :style="{
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
      }"
    >
      {{ label }}
    </p>
    <Listbox
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    >
      <ListboxButton :style="buttonStyle">
        <span>{{ modelValue?.label ?? placeholder ?? 'Select...' }}</span>
        <span>▾</span>
      </ListboxButton>
      <ListboxOptions :style="optionsStyle">
        <ListboxOption
          v-for="item in items"
          :key="item.value"
          :value="item"
          :disabled="item.disabled"
          v-slot="{ active, selected }"
        >
          <div
            :style="{
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: active
                ? theme.colors.surface.subtle
                : 'transparent',
              color: item.disabled
                ? theme.colors.text.disabled
                : theme.colors.text.primary,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              fontWeight: selected
                ? theme.fontWeight.semibold
                : theme.fontWeight.normal,
            }"
          >
            {{ item.label }}
          </div>
        </ListboxOption>
      </ListboxOptions>
    </Listbox>
  </div>
</template>
