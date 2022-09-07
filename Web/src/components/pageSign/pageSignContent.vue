<template>
  <!-- <a-page-header title="表编辑" sub-title="设计表结构"> -->
  <div class="w-full h-full relative">
    <div
      v-for="tab in store.getters.getTabsMenues()"
      :key="tab.Id"
      class="w-full h-full absolute top-0 left-0"
      :style="{ zIndex: tab.Id == store.getters.getCurrentTab().Id ? 10 : -1 }"
    >
      <template v-if="store.getters.getCurrentMenuType() === '数据表'">
        <tableDetail :propId="tab.Id"></tableDetail>
      </template>
      <template v-if="store.getters.getCurrentMenuType() === '视图'">
        <tableViewDetail :propId="tab.Id"></tableViewDetail>
      </template>
      <template v-if="store.getters.getCurrentMenuType() === '数据接口'">
        <apiDetail :propId="tab.Id"></apiDetail>
      </template>
      <template v-if="store.getters.getCurrentMenuType() === '数据任务'">
        <tableTask :propId="tab.Id"></tableTask>
      </template>
      <template v-if="store.getters.getCurrentMenuType() === '数据导出'">
        <exportExcel :propId="tab.Id"></exportExcel>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { store } from '@/store';
import tableDetail from '@/views/hisql/tableDetail/tableDetail.vue';
import tableViewDetail from '@/views/hisql/tableViewDetail/tableViewDetail.vue';
import apiDetail from '@/views/hisql/apiDetail/apiDetail.vue';
import tableTask from '@/views/hisql/tableTask/tableTask.vue';
import exportExcel from '@/views/hisql/exportExcel/exportExcel.vue';

// 数据表 视图   接口API  表任务 模板导出
</script>

<style lang="less" scoped></style>
