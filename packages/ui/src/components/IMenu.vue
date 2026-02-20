<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue';
import IBox from './IBox.vue';
import { useTheme } from '../theme/ThemeProvider';
import { computed } from 'vue';

export interface MenuItemDef {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

const props = defineProps<{
  items: MenuItemDef[];
}>();

const { theme } = useTheme();

const menuStyle = computed(() => ({
  position: 'absolute' as const,
  right: '0',
  marginTop: theme.value.spacing[2],
  minWidth: '12rem',
  borderRadius: theme.value.borderRadius.lg,
  border: `1px solid ${theme.value.colors.surface.border}`,
  boxShadow: theme.value.shadow.lg,
  zIndex: '50',
  padding: theme.value.spacing[1],
}));
</script>

<template>
  <Menu as="div" style="position: relative; display: inline-block">
    <MenuButton as="template">
      <slot name="trigger" />
    </MenuButton>

    <MenuItems>
      <IBox surface="surface" :style="menuStyle">
        <MenuItem
          v-for="item in items"
          :key="item.label"
          :disabled="item.disabled"
          v-slot="{ active }"
        >
          <button
            :style="{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: active
                ? theme.colors.surface.emphasis
                : 'transparent',
              color: item.danger
                ? theme.colors.danger.bg
                : item.disabled
                ? theme.colors.text.disabled
                : theme.colors.text.primary,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              border: 'none',
              fontSize: theme.fontSize.sm,
            }"
            @click="item.onClick"
          >
            {{ item.label }}
          </button>
        </MenuItem>
      </IBox>
    </MenuItems>
  </Menu>
</template>
