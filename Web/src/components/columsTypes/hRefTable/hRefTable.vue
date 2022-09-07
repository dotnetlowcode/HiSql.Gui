<template>
  <div class="operateBlock">
    <div @click="openDialog">
      <slot>
        <a class="settingBtn">选择</a>
      </slot>
    </div>
    <span v-if="!hideSelectValue" class="valueSpan" v-text="viewData.columnValue"></span>
  </div>

  <a-drawer
    v-if="viewData.showDialogSelect"
    :visible="viewData.showDialogSelect"
    width="600"
    title="选择"
    placement="right"
    :closable="true"
    @close="viewData.showDialogSelect = false"
  >
    <template #extra>
      <a-button type="primary" @click="dataOkFun">确认</a-button>
    </template>
    <div v-if="viewData.showFilterButtom" class="refOperateBlock">
      <a-button type="primary" class="mr-10px" @click="openFilter()">
        <FilterOutlined />
        筛选
      </a-button>
      <a-button
        @click="
          () => {
            searchData({});
          }
        "
      >
        清除筛选
      </a-button>
    </div>
    <div v-if="viewData.isLoad" class="loadingWaper">
      <a-spin size="large" />
    </div>
    <a-table
      size="small"
      :bordered="true"
      :pagination="false"
      :data-source="viewData.tableData"
      :scroll="{ x: 'max-content', y: 'max-content' }"
      :columns="viewData.tableColumnStruct"
      :row-selection="rowSelection"
      :row-key="columnStruct.RefField"
    ></a-table>
    <a-drawer
      v-model:visible="viewData.showSearchFromEdit"
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
              searchFromObj?.Submit();
            }
          "
        >
          搜索
        </a-button>
      </template>
      <searchFrom
        :ref="
          obj => {
            searchFromObj = obj as any;
          }
        "
        :search-columns-struct="viewData.searchColumns"
        @search="searchData"
      />
    </a-drawer>
  </a-drawer>
</template>

<script setup lang="ts">
import { FilterOutlined } from '@ant-design/icons-vue';
import { TableRowSelection } from 'ant-design-vue/lib/table/interface';
import { ColumnStruct, valueSplitText } from '../../../serverApi/models/columnStruct';
import { HRefTableViewModel } from './hRefTableViewModel';
import searchFrom from '../searchFrom/searchFrom.vue';
import { SearchFromVue } from '../searchFrom/searchFromViewModel';

/// 这个地方的表结果必须从服务端获取,外来参数增加一个表名
const props = defineProps({
  value: {
    type: String,
    default: ``,
    required: false,
  },
  columnStruct: {
    type: ColumnStruct,
    required: true,
  },
  hideSelectValue: {
    type: Boolean,
    default: false,
  },
  /**
   * 单选表格还是多选,默认值`true`单选
   */
  isMultiValue: {
    type: Boolean,
    default: false,
  },
});
const { viewData, initColumn, loadListData, setColumnValue } = new HRefTableViewModel(
  `${props.columnStruct.RefTab}`,
);
const searchFromObj = ref<SearchFromVue>();
const emit = defineEmits([`change`, `update:value`]);
const rowSelection = reactive<TableRowSelection>({
  onChange: (selectedRowKeys: any[]) => {
    if (selectedRowKeys.length > 1) {
      viewData.columnValue = selectedRowKeys.join(valueSplitText);
    } else {
      viewData.columnValue = `${selectedRowKeys[0]}`;
    }
    rowSelection.selectedRowKeys = selectedRowKeys;
  },
  selectedRowKeys: [props.value] as any[],
  type: props.isMultiValue ? `checkbox` : `radio`,
});
const openDialog = () => {
  initColumn(props.columnStruct);
  loadListData(props.columnStruct, rowSelection);
  viewData.showDialogSelect = true;
};
const openFilter = async () => {
  viewData.showSearchFromEdit = true;
};
const searchData = async (searchParam: object) => {
  await loadListData(props.columnStruct, rowSelection, searchParam);
  viewData.showSearchFromEdit = false;
};

watch([props.value], () => {
  setColumnValue(props.value ?? '');
});
setColumnValue(props.value);
if (props.value && typeof props.value === 'string') {
  rowSelection.selectedRowKeys = props.value.split(`,`);
} else if (props.value && typeof props.value === 'number') {
  rowSelection.selectedRowKeys = [props.value];
}
// 设置初始选中值
const dataOkFun = () => {
  emit(`change`, viewData.columnValue);
  emit('update:value', viewData.columnValue);
  viewData.showDialogSelect = false;
};
</script>

<style lang="less" scoped>
.refOperateBlock {
  padding-bottom: 10px;
}
.operateBlock {
  display: flex;
  align-items: center;
  min-height: 32px;
  .settingBtn {
    display: block;
  }
}
.ant-drawer-body {
  height: calc(100% - 55px);
  .ant-table-content,
  .ant-table,
  .ant-table-scroll,
  .ant-spin-container,
  .ant-spin-nested-loading,
  .ant-table-wrapper {
    height: 100%;
  }
  .ant-table-body {
    max-height: calc(100% - 45px);
  }
  .valueSpan {
    margin-right: 20px;
    max-width: 200px;
  }
  .settingBtn {
    margin-right: 10px;
  }
}
</style>
