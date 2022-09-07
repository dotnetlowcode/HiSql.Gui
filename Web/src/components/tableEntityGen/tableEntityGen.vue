<template>
  <div></div>
</template>
<script setup lang="ts">
import { TableApiViewModel } from '../tableApiDoc/tabApiViewModel';

const props = defineProps({
  viewModel: {
    type: TableApiViewModel,
    required: true,
  },
});
</script>
