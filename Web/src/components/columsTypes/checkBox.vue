<template>
  <a-checkbox :size="size" :checked="value" @change="changeValue" />
</template>

<script setup lang="ts">
import { PropType } from 'vue';

const emit = defineEmits([`change`, 'update:value']);
defineProps({
  value: {
    type: Boolean,
    required: true,
  },
  size: {
    type: String as PropType<'default' | 'small' | 'middle' | 'large' | undefined>,
    required: false,
    default: 'default',
  },
});
const changeValue = (v: any) => {
  const isChecked: boolean = v.target.checked;
  emit('update:value', isChecked);
  emit(`change`, isChecked);
};
</script>
