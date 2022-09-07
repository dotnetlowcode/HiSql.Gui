<template>
  <div class="wrapPanel h-full w-full">
    <a-card :title="isAdd ? `创建任务` : `编辑任务`">
      <template v-if="!isAdd" #extra>
        <a-button type="primary" @click="goAdd()">
          <PlusCircleOutlined />
          新增
        </a-button>
      </template>
      <div class="tableWraper">
        <!-- <div class="blockItem">
          <span class="blockTitle" v-text="`任务类型`"></span>
          <div class="blockContent">
            <a-radio-group v-model:value="viewModel.TaskInfo.Type">
              <a-radio-button value="SQL">SQL</a-radio-button>
              <a-radio-button value="API">API</a-radio-button>
            </a-radio-group>
          </div>
        </div> -->
        <div class="blockItem">
          <span class="blockTitle">任务名：</span>
          <div class="blockContent w-450px">
            <a-input
              v-model:value="viewModel.TaskInfo.Title"
              placeholder="请输入任务名,如销售额日报表...."
            />
          </div>
        </div>
        <div class="blockItem">
          <!-- 多类型,可以是SQL,Excel模板导出任务,API等 -->
          <a-tabs v-model:activeKey="viewModel.TaskInfo.Type">
            <a-tab-pane key="SQL" tab="SQL">
              <div class="blockItem">
                <span class="blockTitle" v-text="`任务${viewModel.TaskInfo.Type}：`" />
                <div class="blockContent w-450px">
                  <a-textarea
                    v-model:value="viewModel.TaskInfo.SQL"
                    placeholder="请输入HiSQL...."
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                  />
                </div>
              </div>
            </a-tab-pane>
            <a-tab-pane key="ExcelExport" tab="Excel导出">
              <div class="min-h-100px">
                <span class="block h-32px leading-32px">选择要执行的Excel任务:</span>
                <div class="flex pb-10px">
                  <h-ref-table
                    v-model:value="viewModel.TaskInfo.TemplateId"
                    :column-struct="viewModel.ExportSelect"
                  />
                </div>
                <span class="block h-32px leading-32px">完成事件推送地址:</span>
                <div class="flex">
                  <a-input
                    v-model:value="viewModel.TaskInfo.EventUrl"
                    placeholder="例如:http://www.event.com/evnet"
                  />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
        <template v-if="viewModel.TaskInfo.Type === 'SQL'">
          <div class="blockItem">
            <span class="blockTitle">数据存储方式：</span>
            <div class="blockContent leading-32px">
              <a-radio-group v-model:value="viewModel.TaskInfo.StoreType">
                <a-radio value="NewCreate">存入新表</a-radio>
                <a-radio value="MergeCreate">覆盖更新</a-radio>
                <a-radio value="ReCreate">重置插入</a-radio>
              </a-radio-group>
            </div>
          </div>
          <div class="blockItem">
            <span class="blockTitle">表名：</span>
            <div class="blockContent">
              <a-input v-model:value="viewModel.TaskInfo.APIUrl">
                <template v-if="viewModel.TaskInfo.StoreType == 'NewCreate'" #addonAfter>
                  <a-select v-model:value="viewModel.TaskInfo.SotreFormat" style="width: 100px">
                    <a-select-option value="yyyy_MM_dd">精确到日</a-select-option>
                    <a-select-option value="yyyy_MM_dd_hh">精确到时</a-select-option>
                    <a-select-option value="yyyy_MM_dd_hh_mm">精确到分</a-select-option>
                  </a-select>
                </template>
              </a-input>
              <div class="blockTip">
                <span
                  v-if="viewModel.TaskInfo.StoreType == 'NewCreate'"
                  v-text="
                    `表格名预览:${viewModel.TaskInfo.APIUrl || 'XXXXX'}_${fomartData(
                      viewModel.TaskInfo.SotreFormat,
                    )}`
                  "
                />
              </div>
            </div>
          </div>
        </template>
        <div class="blockItem">
          <span class="blockTitle">执行周期：</span>
          <div class="blockContent">
            <a-input v-model:value="viewModel.TaskInfo.Cron"></a-input>
          </div>
          <div class="blockRight">
            <a-button type="link" target="_blank" href="http://cron.ciding.cc/">
              <span class="underline">表达式生成</span>
            </a-button>
          </div>
        </div>
        <div class="blockItem">
          <span class="blockTitle">任务状态：</span>
          <div class="blockContent">
            <a-radio-group v-model:value="viewModel.TaskInfo.Status">
              <a-radio-button :value="0">关闭</a-radio-button>
              <a-radio-button :value="1">开启</a-radio-button>
            </a-radio-group>
          </div>
        </div>
        <div class="blockItem pt-20px">
          <span class="blockTitle"></span>
          <a-button type="primary" @click="save">保存</a-button>
        </div>
      </div>
    </a-card>
  </div>
</template>
<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { TableTaskCreateViewModel } from './tableTaskCreateViewModel';

const props = defineProps({
  taskId: {
    type: String,
    required: false,
    default: ``,
  },
});

const fomartData = (formatText: string) => {
  formatText = formatText.replace(`yyyy`, `YYYY`).replace(`dd`, `DD`);
  return dayjs().format(formatText);
};
const viewModel = reactive(new TableTaskCreateViewModel());
(window as any).TT = viewModel;
if (props.taskId) {
  viewModel.Init(props.taskId);
}
const isAdd = computed(() => {
  return !props.taskId;
});
const save = async () => {
  const isSave = await viewModel.Save();
  if (isSave) {
    message.success(`保存成功!`);
  } else {
    message.error(`保存失败!`);
  }
};
// eslint-disable-next-line no-undef
const router = useRouter();
const goAdd = () => {
  router.push({
    name: `tableTaskAdd`,
  });
};
</script>
<style lang="less" scoped>
::v-deep(.ant-card-head-title) {
  color: #191919;
  font-size: 16px;
  font-weight: bold;
}
.tableWraper {
  display: flex;
  flex-direction: column;
  .blockItem {
    display: flex;
    margin-bottom: 10px;
  }
  .blockTitle {
    width: 100px;
    display: block;
    height: 32px;
    line-height: 32px;
    color: #191919;
    text-align: right;
  }
  .blockContent {
    display: block;
  }
  .blockRight {
    padding-left: 10px;
  }
  .blockTip {
    padding-top: 5px;
    font-size: 12px;
    color: #999;
  }
}
::v-deep(.ant-card-bordered) {
  border-top: none !important;
}
</style>
