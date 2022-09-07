<template>
  <MyIcon :type="iconName" />
</template>
<script setup lang="ts">
import { MyIcon } from './hiIconViewModel';

defineProps({
  iconName: {
    type: String,
    required: true,
  },
});
</script>
