<template>
  <tableTaskCreate :task-id="taskId" />
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import tableTaskCreate from '@/components/tableTask/tableTaskCreate.vue';
// eslint-disable-next-line no-undef
const route = useRoute();

let taskId = '';
taskId = route.params.taskId as string;
if (taskId === 'add') {
  taskId = '';
}
</script>
