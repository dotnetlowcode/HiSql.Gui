<template>
  <a-switch
    v-model:checked="textValue"
    :size="size"
    placeholder="请输入..."
    @change="changeValue"
  />
</template>

<script setup lang="ts">
import { PropType } from 'vue';

const textValue = ref<boolean>(false);
const emit = defineEmits([`change`]);
const changeValue = () => {
  emit(`change`, textValue.value);
};
const props = defineProps({
  value: {
    type: Boolean,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  size: {
    type: String as PropType<'default' | 'small' | undefined>,
    required: false,
    default: 'default',
  },
});
// (() => {
textValue.value = props.value ?? false;
// })();
</script>
