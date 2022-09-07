<template>
  <a-input-number
    v-model:value="textValue"
    :size="size"
    placeholder="请输入..."
    @change="changeValue"
  />
</template>

<script setup lang="ts">
import { SizeType } from 'ant-design-vue/lib/config-provider/context';
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
    type: String as PropType<SizeType>,
    required: false,
    default: 'middle',
  },
});
textValue.value = props.value ?? ``;
</script>
