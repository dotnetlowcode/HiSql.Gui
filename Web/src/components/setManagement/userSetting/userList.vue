<template>
  <div class="mainPage">
    <tableDataVue :table-name="`Hi_UserInfo`" :is-view-api="false">
      <template #operate>
        <a-button
          type="primary"
          @click="
            () => {
              viewModel.showAddFrom = true;
            }
          "
        >
          <PlusCircleOutlined />
          增加用户
        </a-button>
      </template>
    </tableDataVue>
  </div>
  <a-drawer
    v-model:visible="viewModel.showAddFrom"
    width="600"
    title="添加用户"
    placement="right"
    :closable="true"
  >
    <template #extra>
      <a-button
        type="primary"
        @click="
          () => {
            viewModel.SaveUser();
          }
        "
      >
        保存
      </a-button>
    </template>
    <FromEdit
      :ref="
      (el: any) => {
        viewModel.FromEditObj = el;
      }"
      field-group-name=""
      :tab-column-data="viewModel.fieldObj"
      :tab-columns="viewModel.fileds"
    ></FromEdit>
  </a-drawer>
</template>
<script lang="ts" setup>
// const props = defineProps({});
// const emits = defineEmits([]);
import tableDataVue from '@/components/tableData/tableData.vue';
import { UserListViewModel } from './userListViewModel';

const viewModel = reactive(new UserListViewModel());
viewModel.Load();
// write some code
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
}
</style>
