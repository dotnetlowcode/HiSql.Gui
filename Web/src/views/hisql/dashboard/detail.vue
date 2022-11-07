<template>
  <div class="mainPage">
    <a-modal
      v-model:visible="viewModel.showTitlePanel"
      title="看板初始化"
      :mask-closable="false"
      :keyboard="false"
      @cancel="() => {}"
      @ok="
        () => {
          viewModel.okFun(router);
        }
      "
    >
      <div class="flex justify-start items-center">
        <div class="mr-10px">看板名:</div>
        <div>
          <a-input v-model:value="viewModel.dashboardName" />
        </div>
      </div>
    </a-modal>
    <table-chart :dashboard-id="id" :is-view-api="false" />
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import tableChart from '@/components/tableChart/tableChart.vue';

import { DashboardViewModel } from './dashboardViewModel';

const viewModel = reactive(new DashboardViewModel());
// eslint-disable-next-line no-undef
const router = useRouter(); // 页面跳转路由;
const route = useRoute(); // 页面路由参数
const id = route.params.id as string;
// const isCreate = id === 'add';
// if (isCreate) {
//   viewModel.showTitlePanel = true;
// }
let isCreate = false;
if (!id) {
  isCreate = true;
} else {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCreate = false;
}
if (isCreate) {
  viewModel.showTitlePanel = true;
} else {
  viewModel.showTitlePanel = false;
}

// const props = defineProps({});
// const emits = defineEmits([]);
// write some code
</script>
<script lang="ts">
export default {
  name: 'DashboardDetail',
};
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
  padding: 20px;
}
</style>
