<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue';
import IBox from './IBox.vue';
import IText from './IText.vue';
import { useTheme } from '../theme/ThemeProvider';
import { computed } from 'vue';

defineProps<{
  open: boolean;
  title?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const { theme } = useTheme();

const overlayStyle = computed(() => ({
  position: 'fixed' as const,
  inset: '0',
  backgroundColor: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
}));

const panelStyle = computed(() => ({
  position: 'relative' as const,
  borderRadius: theme.value.borderRadius.xl,
  padding: theme.value.spacing[6],
  width: '100%',
  maxWidth: '28rem',
  boxShadow: theme.value.shadow.xl,
}));
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog
      as="div"
      style="position: relative; z-index: 50"
      @close="emit('close')"
    >
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div :style="overlayStyle" />
      </TransitionChild>

      <div
        style="
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        "
      >
        <TransitionChild
          as="template"
          enter="duration-200 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-150 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel>
            <IBox surface="surface" :style="panelStyle" border>
              <DialogTitle v-if="title">
                <IText as="h3" size="xl" weight="semibold">{{ title }}</IText>
              </DialogTitle>
              <slot />
            </IBox>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
