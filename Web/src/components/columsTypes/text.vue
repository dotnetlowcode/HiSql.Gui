<template>
  <a-input v-model:value="textValue" :size="size" placeholder="请输入..." @change="changeValue" />
</template>

<script setup lang="ts">
import { PropType } from 'vue';

const textValue = ref<string>(``);
const emit = defineEmits([`change`]);
const changeValue = () => {
  emit(`change`, textValue.value);
};
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String as PropType<'small' | 'middle' | 'large' | undefined>,
    required: false,
    default: 'default',
  },
});
textValue.value = `${props.value ?? ''}`.trim();
emit(`change`, textValue.value);
</script>
