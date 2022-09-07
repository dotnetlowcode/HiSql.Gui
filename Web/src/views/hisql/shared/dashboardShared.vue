<template>
  <div class="mainPage">
    <div class="pTitle">报表看板分享</div>
    <div class="pBody">
      <template v-if="viewModel.Loading">
        <div class="chartsWrap flex justify-center items-center absolute inset-0">
          <a-spin size="large" />
        </div>
      </template>
      <template v-if="viewModel.Charts.length > 0">
        <GridLayout
          v-model:layout="viewModel.Charts"
          :col-num="12"
          :row-height="100"
          :is-draggable="true"
          :is-resizable="true"
          :vertical-compact="true"
          :use-css-transforms="true"
        >
          <GridItem
            v-for="item in viewModel.Charts"
            :key="item.i"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            @moved="
            (i:number, newX:number, newY:number) => {
              viewModel.MoveChart(item, newX, newY);
            }
          "
            @resized="
            (i:number, newX:number, newY:number, newHPx:number, newWPx:number) => {
              viewModel.ResizedEvent(item, newX, newY, newHPx, newWPx);
            }
          "
          >
            <ChartShow
              :ref="
              (el:any) => {
                viewModel.SetDomMap(item.i, el);
              }
            "
              :chart-id="item.i"
              :is-shared="true"
              @full-show="
              (charInfo:ChartDataModel) => {
                viewModel.FullShow(charInfo);
              }
            "
            />
          </GridItem>
        </GridLayout>
      </template>
    </div>
    <a-modal
      v-model:visible="viewModel.FullChartShow"
      :title="viewModel.FullChartTitle"
      :footer="null"
      width="100%"
      wrap-class-name="full-modal"
    >
      <ChartShow
        v-if="viewModel.FullChartShow"
        :chart-id="viewModel.FullChartId"
        :is-full-show="true"
      />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { GridLayout, GridItem } from 'vue3-grid-layout';
import { useRoute } from 'vue-router';
import { ChartDataModel } from '@/components/tableChart/chartHelper/ichart';
import { DashboardSharedViewModel } from './dashboardViewModel';

const props = defineProps({});
const emits = defineEmits([]);

const route = useRoute(); // 页面路由参数
const { id } = route.params;
const viewModel = reactive(new DashboardSharedViewModel(id as string));
// write some code
viewModel.Init().finally(() => {
  viewModel.Loading = false;
});
</script>
<style scoped lang="less">
.mainPage {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  .pTitle {
    font-size: 16px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 10px;
  }
  .pBody {
    position: relative;
    flex-grow: 1;
    overflow: auto;
  }
}
</style>
