<template>
  <div class="exportExcel">
    <div v-if="viewModel.IsLoad" class="loadingWaper">
      <a-spin size="large" />
    </div>
    <a-page-header title="Excel模板导出">
      <div class="flex justify-center">
        <div class="w-1000px text-center">
          <a-steps :current="viewModel.CurrentStep">
            <a-step
              v-for="stepObj in viewModel.Steps"
              :key="stepObj.title"
              :title="stepObj.title"
            ></a-step>
          </a-steps>
          <div class="stepsAction">
            <div v-if="viewModel.CurrentStep === 0" class="upExcel">
              <div class="upFileBlock">
                <a-upload-dragger
                  name="file"
                  :headers="viewModel.GetPostHeader()"
                  :multiple="false"
                  :action="viewModel.PostUrl"
                  @change="uploadChange"
                >
                  <p class="ant-upload-drag-icon">
                    <inbox-outlined></inbox-outlined>
                  </p>
                  <p class="ant-upload-text">单击或拖拽文件到此处上传</p>
                  <p class="ant-upload-hint">只能选择.xlsx,.xls格式的Excel</p>
                </a-upload-dragger>
              </div>
            </div>
            <div v-if="viewModel.CurrentStep === 1" class="sheetMap">
              <div class="flex pt-30px pb-10px">
                <span class="w-80px block h-30px flex flex-col justify-center items-start">
                  导出标题:
                </span>
                <div class="w-400px">
                  <a-input
                    v-model:value="viewModel.MainObj.Title"
                    placeholder="例如:`月度报表`"
                  ></a-input>
                </div>
              </div>
              <a-tabs v-model:activeKey="viewModel.ActiveSheet">
                <a-tab-pane
                  v-for="(sheetData, sheetName) in viewModel.Sheets"
                  :key="sheetName"
                  :tab="sheetName"
                >
                  <table class="sheetTable tableBorder">
                    <tr v-for="(rowObj, rIndex) in sheetData.Rows" :key="rowObj.RId">
                      <td>
                        <a-radio
                          :checked="sheetData.SelectRow === rowObj"
                          @click="sheetRowSelect(sheetData, rowObj, rIndex)"
                        />
                      </td>
                      <td v-for="w in rowObj.Colums" :key="w.CId">
                        <span v-text="w.CellValue"></span>
                      </td>
                    </tr>
                  </table>
                  <div v-if="sheetData.SelectRow" class="mapBlock">
                    <div class="flex h-32px pt-10px">
                      <span class="block h-32px leading-32px">选择数据表表</span>
                      <h-ref-table
                        :value="sheetData.MpaTableName"
                        :column-struct="SelectTable"
                        @change="
                          v => {
                            sheetData.MpaTableName = '';
                            $nextTick(() => {
                              sheetData.MpaTableName = v;
                            });
                          }
                        "
                      />
                    </div>
                    <div v-if="sheetData.MpaTableName" class="pt-20px">
                      <table class="tableBorder w-full">
                        <thead>
                          <tr>
                            <td>Excel表头</td>
                            <td>映射字段</td>
                          </tr>
                        </thead>
                        <tr
                          v-for="selectRowObj in sheetData.SelectRow.Colums"
                          :key="selectRowObj.CId"
                        >
                          <td>
                            <span v-text="selectRowObj.CellValue"></span>
                          </td>
                          <td>
                            <h-drop-down
                              v-model:value="selectRowObj.MapField"
                              :is-multi-value="false"
                              :column-struct="
                                viewModel.GetTableFieldsStruct(sheetData.MpaTableName)
                              "
                            />
                          </td>
                        </tr>
                      </table>
                      <div class="pt-20px">
                        <a-button type="primary" @click="SaveData">保存</a-button>
                      </div>
                    </div>
                  </div>
                </a-tab-pane>
              </a-tabs>
            </div>
            <div v-if="viewModel.CurrentStep === 2" class="">
              <div class="configOver">
                <hi-icon icon-name="icon-wancheng" />
                <span class="ml-10px tipText">已完成</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-page-header>
  </div>
</template>
<script setup lang="ts">
import { InboxOutlined } from '@ant-design/icons-vue';
import { UploadChangeParam } from 'ant-design-vue/lib/upload/interface';
import { UploadFile } from 'ant-design-vue/es/upload/interface';
import { message } from 'ant-design-vue';
import {
  ExportExcelViewModel,
  SheetData,
  SheetTableRow,
  UploadResult,
  SelectTable,
} from './exportExcelViewModel';
import ApiResultModel from '@/serverApi/apiModels/apiResultModel';
import { addExcelExportTemplateRouterName } from '@/router/index';

// const props = defineProps({
//   /**
//    * 页面id
//    */
//   propId: {
//     type: String,
//     required: true,
//   },
// });
// let templateId = props.propId as string;
// if (templateId === addExcelExportTemplateRouterName) {
//   templateId = '';
// }
// eslint-disable-next-line no-undef
const route = useRoute();
const templateId = (route.params.Id ?? '') as string;

const viewModel = reactive(new ExportExcelViewModel(templateId));

viewModel
  .Init()
  .catch(err => {
    message.error(err);
  })
  .finally(() => {
    viewModel.IsLoad = false;
  });

(window as any).W = viewModel;
const uploadChange = (r: UploadChangeParam<UploadFile<ApiResultModel<UploadResult>>>) => {
  // r.file.response.Data.Path
  if (!r.file.response?.Data) {
    return;
  }
  const { Path, Sheets } = r.file.response.Data;
  if (Path) {
    viewModel.MainObj.FileUrl = Path;
    viewModel.SetSheets(Sheets);
  }
};
const sheetRowSelect = (data: SheetData, row: SheetTableRow, rowNumber: number) => {
  data.SelectRow = row;
  data.SelectRowNumber = rowNumber;
};
const SaveData = () => {
  viewModel.IsLoad = true;
  viewModel
    .Save()
    .then(isOk => {
      if (isOk) {
        viewModel.CurrentStep = 2;
        message.success(`已保存!`);
      } else {
        message.success(`保存失败!`);
      }
    })
    .catch(err => {
      message.error(err);
    })
    .finally(() => {
      viewModel.IsLoad = false;
    });
};
</script>
<style lang="less" scoped>
.exportExcel {
  position: relative;
  height: 100vh;
  padding-top: 10px;
}
.stepsAction {
  position: relative;
  height: 300px;
}
.upExcel {
  padding-top: 50px;
  .upFileBlock {
    width: 300px;
    margin: 0 auto;
  }
}
.sheetTable {
  width: 100%;
}
.configOver {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 50px;
  color: #96b3df;
  .tipText {
    font-size: 20px;
  }
}
::v-deep(.ant-select) {
  width: 250px;
}
</style>
