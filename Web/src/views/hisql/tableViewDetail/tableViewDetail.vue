<template>
  <a-page-header title="" sub-title="">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="视图结构">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableStruct-query`">
          <!-- <table-struct :is-view-api="true" :table-name="tableName" /> -->
          <ViewDesignV2 :view-name="tableName" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>
      <a-tab-pane key="2" tab="视图数据" force-render>
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableData-query`">
          <table-data :is-view-api="true" :table-name="tableName" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>
      <a-tab-pane key="3" tab="API">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableApi-query`">
          <table-api :is-view-api="true" :table-name="tableName" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>
      <a-tab-pane key="4" tab="图表">
        <authority-waper :res-id="tableName" :operate-id="`hiTable-tableChart-query`">
          <tableChart :is-view-api="true" :table-name="tableName" />
          <template #accessDenied>
            <noPermission />
          </template>
        </authority-waper>
      </a-tab-pane>
    </a-tabs>
  </a-page-header>
  <exportPanel v-if="activeKey === '2'" />
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import tableData from '../../../components/tableData/tableData.vue';
import tableApi from '../../../components/tableApiDoc/tableApiDoc.vue';
import noPermissionVue from '@/components/authority/noPermission.vue';
import ViewDesignV2 from '@/components/viewDesign/v2/viewDesignV2.vue';

const route = useRoute();
// const tableName = `Hi_FieldModel`; // `Hi_TabModel`;
const tableName = ref(``);
const activeKey = ref(`2`);
tableName.value = route.params.viewName as string;
</script>
<script lang="ts">
export default {
  name: 'TableView',
};
</script>
