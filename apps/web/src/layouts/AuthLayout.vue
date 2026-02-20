<script>
import { IBox } from '@inithium/ui';
</script>

<template>
  <IBox
    as="div"
    surface="surface"
    style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    "
  >
    <RouterView />
  </IBox>
</template>
