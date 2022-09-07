<template>
  <div class="reportDesign">
    <div class="rLeft">
      <div class="mb-10px">
        <a-input-search placeholder="请输入要搜索的字段..." style="width: 210px" />
      </div>
      <div class="chartDataDms">
        <span class="cddTitle">字段</span>
        <draggable
          class="chartFields"
          :sort="false"
          :list="viewModel.DimensionFields"
          :group="{
            name: 'ValueFields',
            pull: 'clone',
            put: false,
          }"
          :clone="cloneValueField"
          item-key="FieldName"
          @start="viewModel.FieldIsDrag = true"
          @end="viewModel.FieldIsDrag = false"
        >
          <template #item="{ element }">
            <div class="chartField !bg-[#e6f5ef]">
              <span v-text="`${element.FieldName}[${element.FieldDesc}]`"></span>
            </div>
          </template>
        </draggable>
      </div>
    </div>
    <div class="rCenter">
      <div class="dimension">
        <div v-for="dsmObj in DsmList" :key="dsmObj.Id" class="dmsItem">
          <span class="dmsTitle" v-text="dsmObj.Title"></span>
          <span class="dmsIcon">
            <hi-icon icon-name="icon-jiahao" />
          </span>
          <draggable
            direction="vertical"
            class="selectChartFields"
            :list="viewModel[dsmObj.BindPropName]"
            group="ValueFields"
            item-key="FieldName"
          >
            <template #item="{ element }">
              <div class="ySelectItem" :title="`${element.FieldName}[${element.FieldDesc}]`">
                <a-popover v-if="dsmObj.Id === `Y`" class="moreBtn">
                  <template #content>
                    <a-divider orientation="left" class="!m-0">统计方式</a-divider>
                    <div
                      v-for="item in element.Calculation"
                      :key="item.Value"
                      class="propItem"
                      @click="
                        () => {
                          element.SelectCalc = item.Value;
                        }
                      "
                    >
                      <check-outlined
                        :style="{
                          visibility: element.SelectCalc === item.Value ? `visible` : `hidden`,
                        }"
                      />
                      <span class="ml-5px" v-text="item.Text"></span>
                    </div>
                  </template>
                  <span class="mr-2px relative top-2px cursor-pointer">
                    <down-outlined />
                  </span>
                </a-popover>
                <span v-text="`${element.FieldName}[${element.FieldDesc}]`" />
                <i
                  class="removeItemBtn"
                  @click="viewModel.RemoSelectItem(viewModel[dsmObj.BindPropName], element)"
                >
                  x
                </i>
              </div>
            </template>
            <template #footer>
              <div
                :class="{
                  dmsDragTip: viewModel.FieldIsDrag,
                }"
                class="dmsTip"
                v-text="viewModel.FieldIsDrag ? `拖拽到此处` : `从左侧拖拽到此处`"
              ></div>
            </template>
          </draggable>
        </div>
        <div class="dmsItem">
          <span class="dmsTitle"></span>
          <span class="dmsIcon"></span>
          <a-button type="primary" class="h-32px w-90px" @click="excute">分析</a-button>
        </div>
      </div>
      <div
        :ref="
      ($el: any) => {
        viewModel.ChartMainDom = $el;
      }"
        class="chartMain"
      ></div>
    </div>
    <div class="rRight">
      <div class="p-10px">
        <a-input
          v-model:value="viewModel.MainChartObj.Title"
          placeholder="请输图表标题..."
          style="width: 210px"
        />
      </div>
      <div class="relative">
        <p class="h-33px bg-[#fcfcfc] pl-15px leading-33px mb-20px">图表类型</p>
        <ul class="chartItems">
          <li
            v-for="item in ChartTypes"
            :key="item.IconName"
            class="chartItem"
            @click="
              () => {
                viewModel.SelectType(item.TypeName);
              }
            "
          >
            <div
              class="iconWarpe"
              :class="{
                selectItem: viewModel.MainChartObj.Type === item.TypeName,
              }"
            >
              <hi-icon class="!flex justify-center items-center" :icon-name="item.IconName" />
            </div>
            <span class="chartTitle" v-text="item.Title" />
          </li>
          <li v-for="k in 3" :key="k" class="chartItem !h-0" />
        </ul>
      </div>
      <div class="relative">
        <p class="h-33px bg-[#fcfcfc] pl-15px leading-33px mb-20px">图表属性</p>
        <div v-if="viewModel.ChartObj?.PropertyRenderFields" class="chartProps">
          <div
            v-for="fieldObj in viewModel.ChartObj?.PropertyRenderFields ?? []"
            :key="fieldObj.columnStruct.FieldName"
            class="flex justify-center items-center px-10px mb-10px"
          >
            <span class="w-80px text-right pr-5px" v-text="fieldObj.columnStruct.FieldDesc"></span>
            <div class="flex-grow">
              <columnsRender
                :param="fieldObj"
                @columnUpdate="
                  ({ fieldName, value }) => {
                    viewModel.UpdateChartSettingValue(fieldName, value);
                  }
                "
              />
            </div>
          </div>
        </div>
      </div>

      <div class="relative pt-10px">
        <tableFieldMap
          :ref="(obj: any) => {
            viewModel.TableFieldMapInstance = obj;
          }"
          :res-id="viewModel.MainChartObj.TableName"
          :type="`Chart`"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DownOutlined, CheckOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import draggable from 'vuedraggable';
import columnsRender from '@/components/columsTypes/columnsRender/columnsRender.vue';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';
import {
  ChartTypes,
  ColumnStructToDimensionField,
  DsmList,
  TableChartViewModel,
} from './chartDesignViewModel';

const props = defineProps({
  tableName: {
    type: String,
    required: false,
    default: ``,
  },
  isViewApi: {
    type: Boolean,
    required: true,
    default: false,
  },
  chartId: {
    type: String,
    required: false,
    default: '',
  },
  dbId: {
    type: String,
    required: true,
    default: '',
  },
});

const viewModel = reactive(
  new TableChartViewModel(props.dbId, {
    tableName: props.tableName,
    chartId: props.chartId,
  }),
);
viewModel.Init();

const cloneValueField = (sourcesObj: ColumnStruct) => {
  return ColumnStructToDimensionField(sourcesObj);
};
const excute = () => {
  viewModel.Excute();
};
defineExpose({
  Save: async () => {
    return viewModel.Save();
  },
});
</script>

<style lang="less" scoped>
@borderColor: #e5e7eb;
@borderstyle: solid 2px @borderColor;
@valueBgColor: #e6f5ef;
@dmsBgColor: #ecf0fb;

.reportDesign {
  display: flex;
  height: calc(100vh - 75px);
  border-top: @borderstyle;
  margin: -24px;
  margin-top: 0;

  .rLeft {
    width: 240px;
    border-right: @borderstyle;
    padding-left: 15px;
  }

  .rLeft {
    flex: 0 0 210px;
    padding-top: 10px;
    display: flex;
    flex-direction: column;
  }

  .rCenter {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .rRight {
    position: relative;
    flex: 0 0 300px;
    border-left: @borderstyle;
    overflow: auto;
  }

  .chartDataDms {
    flex: 1 1 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .chartFields {
      overflow: auto;
      padding-right: 2px;
    }

    .chartField {
      min-height: 32px;
      margin-bottom: 5px;
      background-color: #ecf0fb;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: 10px;
      font-size: 14px;
      color: #808080;
      cursor: move;
    }

    .cddTitle {
      height: 32px;
    }
  }

  .chartItems {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    flex-direction: row;
  }

  .chartItem {
    position: relative;
    width: 70px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-content: center;
    cursor: pointer;
    margin-bottom: 8px;
    flex-direction: column;

    .chartTitle {
      font-size: 14px;
      padding-top: 5px;
    }

    .iconWarpe {
      border: solid 1px @borderColor;
      border-radius: 5px;
      font-size: 40px;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      width: 60px;
      height: 50px;
    }
  }

  .selectItem {
    border: solid 2px @primary-color !important;
  }

  .dimension {
    position: relative;

    .selectChartFields {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
    }

    .dmsItem {
      height: 50px;
      line-height: 50px;
      border-bottom: solid 1px @borderColor;
      padding-left: 40px;
      font-size: 14px;
      color: #191919;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .dmsTitle {
      width: 56px;
      text-align: right;
    }

    .dmsIcon {
      font-size: 16px;
      padding-left: 12px;
      padding-right: 24px;
      position: relative;
      top: 1px;
      width: 52px;
    }

    .dmsTip {
      font-size: 14px;
      text-align: left;
      color: #b3b3b3;
      height: 30px;
      line-height: 30px;
      border: dashed 1px transparent;
    }

    .ySelectItem {
      margin-right: 5px;
      background-color: @valueBgColor;
      position: relative;
      padding-right: 15px !important;
      position: relative;
      overflow: hidden;
      padding-left: 20px !important;
      word-wrap: break-word;
      max-width: 150px;

      .moreBtn {
        position: absolute;
        left: 4px;
        top: 2px;
        z-index: 10;
      }
    }

    .removeItemBtn {
      position: absolute;
      right: 0px;
      top: 0px;
      z-index: 10;
      width: 20px;
      height: 20px;
      line-height: 18px;
      font-style: normal;
      color: white;
      background-color: red;
      border-radius: 10px;
      overflow: hidden;
      display: none;
      font-size: 18px;
      text-align: center;
      transform: scale(0.6);
      position: absolute;
      top: 5px;
      right: 0px;
      cursor: pointer;
    }

    .ySelectItem:hover {
      .removeItemBtn {
        display: block;
      }
    }

    .dmsDragTip {
      border: dashed 1px @borderColor;
      background-color: @valueBgColor;
    }

    .ySelectItem,
    .dmsTip {
      height: 30px;
      line-height: 30px;
      border-radius: 4px;
      padding: 0px 5px;
    }
  }

  .chartMain {
    flex-grow: 1;
    width: calc(100% - 40px);
    overflow: hidden;
    margin: 20px auto 0;
  }
}

.propItem {
  height: 24px;
  cursor: pointer;
}
</style>
