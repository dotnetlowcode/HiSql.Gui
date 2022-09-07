<template>
  <div class="apiParams">
    <div class="mb-16px">
      <a-button class="addparamclass" size="middle" @click="addParam">
        <template #icon>
          <MyIcon class="text-[#3144F5]" type="icon-a-HiSqlGUIICON_zengjia" />
        </template>
        添加参数
      </a-button>
    </div>
    <table v-if="loadIng" class="table">
      <thead>
        <td class="w-40px"></td>
        <td class="w-150px">参数名</td>
        <td class="w-100px">数据类型</td>
        <td class="w-80px">是否必填</td>
        <td v-if="isRefParam" class="min-w-300px">值来源</td>
        <td class="min-w-100px">默认值</td>
        <td class="min-w-100px">测试值</td>
        <td class="min-w-200px">说明</td>
        <td class="w-60px">操作</td>
      </thead>
      <tbody>
        <tr v-for="field in paramList" :key="field.FackId">
          <td class="bg-[#ffffff]"></td>
          <td class="bg-[#ffffff]" v-for="fName in randerFileds" :key="fName">
            <paramRef
              v-if="fName === `ValueFrom`"
              v-model:valueFrom="field.ValueFrom"
              :block-list="blockList"
            ></paramRef>
            <click-edit-render
              v-else
              v-model:value="(field as any)[fName]"
              :field-type="tableParamStruct[fName]"
            />
          </td>
          <td class="bg-[#ffffff]">
            <a class="cursor-pointer" @click="deleteParam(field)">
              <!-- <MyIcon type="icon-shanchu2" /> -->
              删除
            </a>
          </td>
        </tr>
        <!-- <tr>
          <td class="text-center cursor-ns-resize"></td>
          <td>
            <span class="cursor-pointer" @click="addParam">添加参数</span>
          </td>
          <td rowspan="7"></td>
        </tr> -->
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { List } from 'linqts';
import { HiApiParamEntity } from '@/serverApi/models/tableModel/hiApiFields';
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
  apiBodyId: {
    type: String,
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
  const p = new HiApiParamEntity();
  p.ApiBodyId = props.apiBodyId;
  tempArray.push(p);
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
<style lang="less" scoped>
.addparamclass {
  background: #f1f4fb !important;
  color: #3144f5 !important;
  border: none;
  outline: none;
}
</style>
