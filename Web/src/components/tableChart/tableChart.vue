<template>
  <div class="wrapPanel">
    <div class="topOperate">
      <div class="leftBtn">
        <a-button
          v-if="viewModel.Dashboard.DBId"
          type="primary"
          class="mr-10px"
          @click="viewModel.ShowAddChart = true"
        >
          <hi-icon :icon-name="`icon-tianjia`"></hi-icon>
          添加图表
        </a-button>
        <a-button v-if="viewModel.Charts.length > 0" @click="copySharedUrl">
          <hi-icon :icon-name="`icon-fenxiang`"></hi-icon>
          分享
        </a-button>
        <input
          :ref="(el: any) => {
          sharedDomObj = el;
        }"
          class="sharedInput"
          :value="viewModel.SharedUrl"
        />
      </div>
      <div v-if="viewModel.Charts.length > 0" class="rightBtn">
        <a-button type="primary" @click="openFilter">
          <FilterOutlined />
          过滤条件
        </a-button>
      </div>
    </div>
    <div class="chartsWrap">
      <template v-if="viewModel.Loading || viewModel.Saveing">
        <div class="chartsWrap flex justify-center items-center absolute inset-0">
          <a-spin size="large" />
        </div>
      </template>
      <template v-if="!viewModel.Loading">
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
                (i: number, newX: number, newY: number) => {
                  viewModel.MoveChart(item, newX, newY);
                }
              "
              @resized="
  (i: number, newX: number, newY: number, newHPx: number, newWPx: number) => {
    viewModel.ResizedEvent(item, newX, newY, newHPx, newWPx);
  }
"
            >
              <ChartShow
                :ref="
                (el: any) => {
                  viewModel.SetDomMap(item.i, el);
                }
              "
                :chart-id="item.i"
                @edit="
                  () => {
                    viewModel.OpenEditChart(item.i);
                  }
                "
                @delete="
                  () => {
                    viewModel.DeleteChart(item);
                  }
                "
                @full-show="
  (charInfo: ChartDataModel) => {
    viewModel.FullShow(charInfo);
  }
"
              />
            </GridItem>
          </GridLayout>
        </template>
        <template v-else>
          <div class="w-full h-full flex justify-center items-center">
            <a-empty description="还没有添加任何报表,快去添加吧!" />
          </div>
        </template>
      </template>
    </div>
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
  <a-drawer
    v-if="viewModel.Dashboard.DBId && viewModel.ShowAddChart"
    v-model:visible="viewModel.ShowAddChart"
    width="100%"
  >
    <chart-design
      ref="chartDesignObj"
      :table-name="tableName"
      :is-view-api="props.isViewApi"
      :db-id="viewModel.Dashboard.DBId"
      :chart-id="viewModel.EditChartId"
    />
    <template #extra>
      <a-button class="saveBtn" type="link" @click="saveChart">保存图表并退出</a-button>
    </template>
  </a-drawer>

  <a-drawer
    v-model:visible="viewModel.ShowSearchFrom"
    width="600"
    title="搜索"
    placement="right"
    :closable="true"
  >
    <template #extra>
      <a-button
        type="primary"
        @click="
          () => {
            viewModel.SearchFromObj?.Submit();
          }
        "
      >
        <CheckOutlined />
        搜索
      </a-button>
    </template>
    <searchFrom
      :ref="
    (el: any) => {
      viewModel.SearchFromObj = el;
    }"
      :search-columns-struct="viewModel.SearchFields"
      @search="searchData"
    />
  </a-drawer>
</template>
<script setup lang="ts">
import { message } from 'ant-design-vue';
import { GridLayout, GridItem } from 'vue3-grid-layout';
import { FilterOutlined } from '@ant-design/icons-vue/lib/icons';
import { CheckOutlined } from '@ant-design/icons-vue';
import { ChartSaveResult } from '@/serverApi/chartAPIs';
import ChartShow from './chartShow/chartShow.vue';
import { TableChartViewModel } from './tableChartViewModel';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChartDataModel } from './chartHelper/ichart';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

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
const chartDesignObj = ref<{
  Save: () => Promise<ChartSaveResult>;
}>();
const viewModel = reactive(new TableChartViewModel(props.tableName));
// const tableFieldList = ref<Array<ColumnStruct>>([]);
// 注入表格字段
provide('TableFields', viewModel.TableFields);
viewModel.Init().finally(() => {
  viewModel.Loading = false;
});

const saveChart = () => {
  viewModel.Saveing = true;
  chartDesignObj.value
    ?.Save()
    .then(r => {
      viewModel.ShowAddChart = false;
      if (r.IsOk && r.IsAdd) {
        viewModel.AddItem(r.ChartId);
      } else {
        viewModel.Refresh(r.ChartId);
      }
    })
    .catch(err => {
      message.error(err);
    })
    .finally(() => {
      viewModel.Saveing = false;
    });
};
const openFilter = () => {
  viewModel.ShowSearchFrom = true;
};
const searchData = async (searchParam: object) => {
  // await loadListData(searchParam);
  viewModel.ShowSearchFrom = false;
  viewModel.SearchFrom(searchParam);
};
const sharedDomObj = ref();
const copySharedUrl = async () => {
  sharedDomObj.value.select();
  document.execCommand(`copy`);
  message.success(`已复制到剪切板!`);
};
</script>
<style lang="less" scoped>
.wrapPanel {
  position: relative;
}

.topOperate {
  position: relative;
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  .leftBtn,
  .rightBtn {
    display: flex;
  }

  .leftBtn {
    overflow: hidden;
    position: relative;

    .sharedInput {
      position: absolute;
      left: -100px;
      top: -100px;
    }
  }

  .rightBtn {
    padding-right: 10px;
  }
}

.chartsWrap {
  height: calc(100vh - 270px);
  overflow: auto;

  .chartInfo {
    width: 50%;
    height: 250px;
    border: solid 1px #ccc;
  }
}

.saveBtn {
  position: absolute;
  left: 55px;
  top: 10px;
}

::v-deedp(.ant-drawer-body) {
  overflow: hidden !important;
}
</style>
