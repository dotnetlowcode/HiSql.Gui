<template>
  <div class="mainPage">
    <template v-if="currentPage !== `DataInit`">
      <hRefTableSelect
        v-model:value="viewModel.Value"
        :ref-config="{
          RefTab: `Hi_ModuleTypeOperate`,
          RefTextField: 'Name',
          RefValueField: 'MOperateId',
          RefWhere: `MId='eb9ae39e-8922-4585-bd60-245e06d1775c'`,
        }"
        @change="changeValue"
      ></hRefTableSelect>
      <div class="border-solid border-light-200 border-1px">
        <span>权限测试</span>
        <div>
          <authorityWaper :module-id="`hiApi-list`" :operate-id="`hitable-tableStruct-query`">
            <a-button>编辑</a-button>
          </authorityWaper>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="w-500px">
        <a-textarea
          v-model:value="viewModel.dataYml"
          class="h-200px"
          placeholder="请粘贴Yml"
          allow-clear
        />
      </div>
      <div class="pt-10px">
        <a-button
          type="primary"
          @click="
            () => {
              viewModel.Save();
            }
          "
        >
          保存
        </a-button>
      </div>
      <div class="pt-10px">
        <span class="block" v-text="`模块:${viewModel.currentSaveModuleIndex}`"></span>
        <span class="block" v-text="`模块操作:${viewModel.currentSaveModuleOperate}`"></span>
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
// const props = defineProps({});
// const emits = defineEmits([]);

import authorityWaper from '@/components/authority/authorityWaper.vue';
import hRefTableSelect from '@/components/columsTypes/hRefTableSelect/hRefTableSelect.vue';

import { PageViewModel } from './pageViewModel';

const currentPage = ref(`DataInit`);
// currentPage.value = 'Test';
// write some code
const viewModel = reactive(new PageViewModel());
const changeValue = (v1: any, v2: any) => {
  console.log(v1, v2);
};
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
  padding: 20px;
}
</style>
