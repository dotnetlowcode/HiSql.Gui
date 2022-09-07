<template>
  <!-- <a-page-header title="表编辑" sub-title="设计表结构"> -->
  <a-page-header title="" sub-title="">
    <a-tabs v-model:activeKey="activeKey" :tab-bar-style="{ color: `red` }">
      <a-tab-pane key="1" tab="表结构">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableStruct-query`">
          <tableStruct :table-name="tableName" :is-view-api="false" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>

      <a-tab-pane key="4" tab="表索引">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableIndex-query`">
          <indexList :table-name="tableName"></indexList>
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>

      <a-tab-pane key="2" tab="表数据" force-render>
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableData-query`">
          <tableData :table-name="tableName" :is-view-api="false" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>

      <a-tab-pane key="3" tab="API">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableApi-query`">
          <table-api :is-view-api="false" :table-name="tableName" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>

      <a-tab-pane key="5" tab="图表">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableChart-query`">
          <tableChart :is-view-api="false" :table-name="tableName" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>
    </a-tabs>
    <exportPanel v-if="activeKey === '2'" />
  </a-page-header>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import tableStruct from '../../../components/tableStruct/tableStruct.vue';
import tableData from '../../../components/tableData/tableData.vue';
import tableApi from '../../../components/tableApiDoc/tableApiDoc.vue';
import indexList from '../../../components/tableIndexs/indexList.vue';
import tableChart from '@/components/tableChart/tableChart.vue';

// eslint-disable-next-line no-undef
const route = useRoute();
// const tableName = `Hi_FieldModel`; // `Hi_TabModel`;
const tableName = ref(``);
const activeKey = ref(`1`);
tableName.value = route.params.tableName as string;
</script>
<script lang="ts">
export default {
  name: 'Table',
};
</script>
<style lang="less" scoped>
::v-deep(.ant-tabs-tab .ant-tabs-tab-btn) {
  color: #666666;
  font-size: 14px;
}

::v-deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #3144f5;
}
</style>
