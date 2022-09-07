<template>
  <div class="matchParam">
    <a-select v-model:value="selectBlockId" size="small" style="width: 100px" :options="blockIds" />
    <span>=></span>
    <a-select
      v-model:value="selectParamName"
      size="small"
      style="width: 120px"
      :options="paramList"
    />
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { BlockParam } from './paramRefViewModel';

// 值来自apiBlock.vue的注入
const blockIndex = inject<number>('BlockIndex') ?? 0;

const emits = defineEmits(['update:valueFrom']);
const props = defineProps({
  blockList: {
    type: Array as PropType<Array<BlockParam>>,
    required: true,
  },
  valueFrom: {
    type: String,
    required: true,
  },
});
const selectBlockId = ref(``);
const selectParamName = ref(``);
if (props.valueFrom.length > 1) {
  const selectArray = props.valueFrom.split(`.`);
  if (selectArray.length === 2) {
    selectBlockId.value = selectArray[0] as string;
    selectParamName.value = selectArray[1] as string;
  }
}
const blockIds = computed(() => {
  const blockDropList = reactive<
    Array<{
      value: string;
      label: string;
    }>
  >([]);
  let i = 0; // 只能显示流程在自己模块前面的模块结果参数或全局参数
  props.blockList.forEach(r => {
    if (i <= blockIndex) {
      blockDropList.push({ value: r.BlockId, label: r.BlockName });
    }
    i += 1;
  });
  return blockDropList;
});
const paramList = computed(() => {
  const paramDropList = reactive<Array<{ value: string }>>([]);
  for (let index = 0; index < props.blockList.length; index++) {
    const blockObj = props.blockList[index];
    if (blockObj.BlockId === selectBlockId.value) {
      blockObj.OutParam.forEach(k => {
        paramDropList.push({ value: k.Title });
      });
      break;
    }
  }
  return paramDropList;
});
const valueChange = () => {
  if (selectBlockId.value && selectParamName.value) {
    emits('update:valueFrom', `${selectBlockId.value}.${selectParamName.value}`);
  }
};
watch(selectBlockId, () => {
  selectParamName.value = ``;
});
watch(selectParamName, () => {
  valueChange();
});
</script>
<style scoped lang="less">
.matchParam {
  position: relative;
  display: flex;
  justify-content: space-evenly;
  flex-direction: row;
  align-items: center;
}
</style>
