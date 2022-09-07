<template>
  <div class="apiParams">
    <table v-if="loadIng" class="table">
      <thead>
        <td class="w-40px"></td>
        <td class="w-150px">参数名</td>
        <td class="w-100px">数据类型</td>
        <td class="min-w-300px">示例值</td>
      </thead>
      <tbody>
        <tr v-for="field in paramList" :key="field.FackId">
          <td></td>
          <td><span v-text="field.Title"></span></td>
          <td><span v-text="ParamFieldType[field.Type]"></span></td>
          <td><span v-text="field.DemoValue"></span></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { List } from 'linqts';
import { HiApiParamEntity, ParamFieldType } from '@/serverApi/models/tableModel/hiApiFields';
import { ApiParamViewModel, Paramfields } from './apiParamViewModel';
import { MyIcon } from '@/components/Icon/hiIconViewModel';
import paramRef from '../paramRef/paramRef.vue';
import { BlockParam } from '../paramRef/paramRefViewModel';

const emits = defineEmits([`update:paramList`]);
const props = defineProps({
  paramList: {
    type: Array as PropType<Array<HiApiParamEntity>>,
    required: true,
  },
  blockList: {
    type: Array as PropType<Array<BlockParam>>,
    required: true,
  },
  isRefParam: {
    type: Boolean,
    defalut: false,
  },
});
const viewModel = new ApiParamViewModel();
viewModel.loading().then(() => {});
const { tableParamStruct, loadIng } = viewModel;
const addParam = () => {
  const tempArray = [...props.paramList];
  tempArray.push(new HiApiParamEntity());
  emits('update:paramList', tempArray);
};

const deleteParam = (paramObj: HiApiParamEntity) => {
  const tempArray = [...props.paramList];
  const indexOf = tempArray.indexOf(paramObj);
  tempArray.splice(indexOf, 1);
  emits('update:paramList', tempArray);
};
const randerFileds = computed(() => {
  if (props.isRefParam) {
    return Paramfields;
  }
  return new List(Paramfields).Where(r => r !== 'ValueFrom').ToArray();
});
</script>
