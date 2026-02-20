<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../theme/ThemeProvider';

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'search'
  | 'url'
  | 'tel';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    type?: InputType;
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    id?: string;
  }>(),
  {
    type: 'text',
    disabled: false,
    required: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const { theme } = useTheme();

const inputStyle = computed(() => {
  const t = theme.value;
  const c = t.colors;
  return {
    width: '100%',
    padding: `${t.spacing[2]} ${t.spacing[3]}`,
    backgroundColor: c.surface.bg,
    color: c.text.primary,
    border: `1px solid ${props.error ? c.danger.bg : c.surface.border}`,
    borderRadius: t.borderRadius.md,
    fontSize: t.fontSize.base,
    fontFamily: t.fontFamily.sans,
    outline: 'none',
    transition: 'border-color 0.15s',
  };
});

const labelStyle = computed(() => {
  const t = theme.value;
  return {
    display: 'block',
    marginBottom: t.spacing[1],
    fontSize: t.fontSize.sm,
    fontWeight: t.fontWeight.medium,
    color: t.colors.text.primary,
  };
});
</script>

<template>
  <div>
    <label v-if="label" :for="id" :style="labelStyle">
      {{ label
      }}<span v-if="required" style="color: red; margin-left: 2px">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :style="inputStyle"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <p
      v-if="error"
      :style="{
        color: theme.colors.danger.bg,
        fontSize: theme.fontSize.sm,
        marginTop: theme.spacing[1],
      }"
    >
      {{ error }}
    </p>
    <p
      v-else-if="hint"
      :style="{
        color: theme.colors.text.secondary,
        fontSize: theme.fontSize.sm,
        marginTop: theme.spacing[1],
      }"
    >
      {{ hint }}
    </p>
  </div>
</template>
