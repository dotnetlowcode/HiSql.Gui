<template>
  <div class="flex flex-row">
    <a-tabs v-model:activeKey="activeKey" tab-position="left">
      <template v-if="!isViewApi">
        <a-tab-pane key="Add" tab="新增" />
        <a-tab-pane key="Update" tab="更新" />
      </template>
      <a-tab-pane key="Query" tab="查询" />
      <a-tab-pane v-if="!isViewApi" key="Delete" tab="删除" />
      <a-tab-pane key="Entity" tab="模型" />
    </a-tabs>
    <template v-if="activeKey === ``">
      <div class="w-full h-200px flex flex-row justify-center items-center">
        <a-spin size="large" />
      </div>
    </template>
    <template v-else>
      <div class="flex-grow apiDocBody">
        <ApiDocDetail api-id="hi-table-add" :view-model="viewModel" />
      </div>
    </template>
  </div>
</template>
<script lang="ts" setup>
import ApiDocDetail from '../apiDocDetail/ApiDocDetail.vue';
import { TableApiViewModel } from './tabApiViewModel';

const props = defineProps({
  tableName: {
    type: String,
    required: true,
  },
  isViewApi: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const viewModel = new TableApiViewModel(props.tableName);
viewModel.loadTableInfo();
const { activeKey } = viewModel;
console.log(viewModel);
</script>
<style lang="less" scoped>
.apiDocBody {
  max-width: calc(100% - 100px);
}
</style>
