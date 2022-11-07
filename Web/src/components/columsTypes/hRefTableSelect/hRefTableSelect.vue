<template>
  <div class="flex justify-start items-center">
    <div v-for="optionItem in viewData.optionList" :key="optionItem.Title" class="mr-10px">
      <a-checkbox v-model:checked="optionItem.IsSelect" @change="selectChange">
        {{ optionItem.Title }}
      </a-checkbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HRefTableSelectViewModel, RefTableSelectOption } from './hRefTableSelectViewModel';

const props = defineProps({
  refConfig: {
    type: RefTableSelectOption,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  // eslint-disable-next-line vue/require-default-prop
  handleType: {
    type: String,
    required: false,
  }, // 操作类型,同一个页面多个组件一起调用，合并选择数据时需要用到类型区分，例如权限管理页面
});
const emits = defineEmits([`update:value`, `change`]);
const viewModel = new HRefTableSelectViewModel();
const { viewData } = viewModel;
viewData.defaultValue = `${props.value}`;
viewModel.init(props.refConfig);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectChange = () => {
  const { valueStr, textStr } = viewModel.getSelectValue();


  let newValueStr = '';
  let newTextStr = '';
  // 处理字符串最后的逗号
  if (valueStr && textStr) {
    newValueStr = valueStr.slice(0, valueStr.length - 1);
    newTextStr = textStr.slice(0, textStr.length - 1);
  }
  emits('update:value', newValueStr);
  emits('change', newValueStr, newTextStr, props.handleType);
};
defineExpose(viewModel);
</script>
