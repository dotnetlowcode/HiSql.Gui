<template>
  <div ref="tableDataMain" class="wrapPanel tableData">
    <!-- <canvasDatagridComponents
      :data="data"
      :columns="columns"
      :columnsFull="columnStruct"
      :isViewTable="isViewApi"
      @update:param-list="mainParamChange"
    ></canvasDatagridComponents> -->
    <!--  <bigDataTable
      v-if="!!columns.length"
      :data="data"
      :columns="columns"
      :columnsFull="columnStruct"
      :isViewTable="isViewApi"
      @update:param-list="mainParamChange"
    ></bigDataTable> -->
    <div class="topPanel">
      <a-spin tip="数据加载中..." :spinning="loadIng">
        <!-- :title="`表名:${tableName}`" -->
        <a-card size="small" :bordered="false">
          <template #extra>
            <slot name="operate">
              <a-popconfirm
                title="您确定要清空表吗?"
                ok-text="是"
                cancel-text="否"
                @confirm="clearTable"
              >
                <a-button>
                  <hiIcon :icon-name="`icon-qingkong1`"></hiIcon>
                  清空表
                </a-button>
              </a-popconfirm>

              <a-popconfirm
                v-if="showDelete"
                title="您确定要删除吗?"
                ok-text="是"
                cancel-text="否"
                @confirm="batchDelete"
              >
                <a-button type="primary">
                  <DeleteOutlined />
                  批量删除
                </a-button>
              </a-popconfirm>
              <template v-if="!isSetPage">
                <a-upload
                  v-if="!isViewApi"
                  name="file"
                  class="w-103px block"
                  :headers="viewModel.GetPostHeader()"
                  :multiple="false"
                  :action="viewModel.PostUrl"
                  @change="uploadChange"
                >
                  <a-button>
                    <hiIcon :icon-name="`icon-shujudaoru`"></hiIcon>
                    导入
                  </a-button>
                  <template #itemRender></template>
                </a-upload>

                <a-dropdown>
                  <template #overlay>
                    <a-menu
                      @click="
                  e => {
                    exportQueryData(e.key as exportType);
                  }
                "
                    >
                      <a-menu-item key="template">数据模板</a-menu-item>
                      <a-menu-item key="currentData">当前数据</a-menu-item>
                      <a-menu-item key="allData">全部数据</a-menu-item>
                    </a-menu>
                  </template>
                  <a-button>
                    <hiIcon :icon-name="`icon-shujudaochu`" />
                    导出
                    <DownOutlined />
                  </a-button>
                </a-dropdown>
              </template>
              <a-button @click="openFilter()">
                <FilterOutlined />
                筛选
              </a-button>
              <a-button v-if="!isViewApi" type="primary" @click="openColumnSetting(null)">
                <PlusCircleOutlined />
                增加
              </a-button>
            </slot>
          </template>
          <!-- <a-table
            size="small"
            :row-selection="(rowSelection as any)"
            style="width: 100%; height: 100%"
            :columns="columns"
            :data-source="data"
            row-key="hiRowKey"
            :pagination="pagination"
            :scroll="{ x: 'max-content', y: 'max-content' }"
          >
            <template #action="{ record }">
              <a class="mr-10px" @click="openColumnSetting(record)">编辑</a>
              <a-popconfirm
                title="您确定要删除吗?"
                ok-text="是"
                cancel-text="否"
                @confirm="deleteDataColumn(record)"
              >
                <a>删除</a>
              </a-popconfirm>
            </template>
          </a-table> -->
          <vxe-table
            ref="xTable"
            show-header-overflow
            show-overflow
            :row-config="{ isHover: true }"
            :data="data"
            :radio-config="{ highlight: true }"
            :scroll-x="{ enabled: true, gt: 0, scrollToLeftOnChange: true }"
            :scroll-y="{ enabled: true, gt: 0, scrollToTopOnChange: true, mode: 'wheel' }"
            :height="tableheight"
            @checkbox-change="rowSelectionCheck"
            @checkbox-all="rowSelectionCheck"
          >
            <vxe-column type="checkbox" width="60"></vxe-column>
            <vxe-column
              v-for="item in columns"
              :key="item"
              :field="item.dataIndex"
              :title="item.title"
              :width="item.width"
            ></vxe-column>
            <vxe-column title="操作" width="160" fixed="right">
              <template #default="{ row }">
                <vxe-button @click="openColumnSetting(row)">编辑</vxe-button>
                <vxe-button @click="deleteDataColumn(row)">删除</vxe-button>
              </template>
            </vxe-column>
          </vxe-table>
          <vxe-pager
            v-model:page-size="pagination.pageSize"
            v-model:current-page="pagination.current"
            :layouts="[
              'Sizes',
              'PrevJump',
              'PrevPage',
              'Number',
              'NextPage',
              'NextJump',
              'FullJump',
              'Total',
            ]"
            :page-sizes="[10, 15, 20, 30, 50, 100, 500, 1000, 5000, 10000]"
            :total="pagination.total"
            @page-change="handlePageChange"
          ></vxe-pager>
        </a-card>
      </a-spin>
    </div>
  </div>
  <a-drawer
    v-model:visible="showFromEdit"
    width="600"
    :title="fromEditTitle"
    placement="right"
    :closable="true"
  >
    <dataEdit
      v-if="showFromEdit"
      :tab-columns="fromEditPropStruct"
      :tab-column-data="fromEditColumnObj"
      :closable="true"
      @save="saveFrom"
    />
  </a-drawer>
  <a-drawer
    v-model:visible="showSearchFromEdit"
    width="600"
    title="搜索"
    placement="right"
    :closable="true"
  >
    <!-- <template #extra>
      <a-button
        type="primary"
        @click="
          () => {
            viewModel.searchFrom.Submit();
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
      viewModel.searchFrom = el;
    }"
      :search-columns-struct="searchColumns"
      @search="searchData"
    /> -->
    <template #extra>
      <a-button
        type="primary"
        @click="
          () => {
            viewModel.whereTableV2.Submit();
          }
        "
      >
        <CheckOutlined />
        搜索
      </a-button>
    </template>
    <whereTableV2
      :ref="
    (el: any) => {
      viewModel.whereTableV2 = el;
    }"
      :table-columns-struct="columnStruct"
      :search-columns-struct="searchColumns"
      @search="searchData"
    />
  </a-drawer>
</template>
<script lang="ts" setup>
import {
  PlusCircleOutlined,
  FilterOutlined,
  DeleteOutlined,
  DownOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { TablePaginationConfig } from 'ant-design-vue/es/table/Table';
import { useStore } from 'vuex';
import { UploadChangeParam, UploadFile } from 'ant-design-vue/es/upload/interface';
import Modal from 'ant-design-vue/es/modal/Modal';
import { createVNode } from 'vue';
import dataEdit from '../columsTypes/dataEdit/dataEdit.vue';
import searchFrom from '../columsTypes/searchFrom/searchFrom.vue';
import whereTableV2 from '../columsTypes/whereTableV2/whereTableV2.vue';
import TableDetailViewModel, { exportType, ImportExcelResult } from './tableDataViewModel';
import { ColumnStruct } from '../../serverApi/models/columnStruct';
import { StoreType } from '@/store';
import { ExportTaskInfoModel } from '@/store/model/ExportTaskInfo';
import { getSearchColumns } from '@/serverApi/dataHelper';
import ApiResultModel from '@/serverApi/apiModels/apiResultModel';

const xTable = ref();
const tableheight = ref();
tableheight.value = window.innerHeight - 330;
window.onresize = async () => {
  tableheight.value = window.innerHeight - 330;
};

const store = useStore<StoreType>();
const showFromEdit = ref(false);
const loadIng = ref(false);
const fromEditTitle = ref(``);
const fromEditPropStruct = reactive<Array<ColumnStruct>>([]);
const fromEditColumnObj = ref<any>({});
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
  isSetPage: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// 表列的表头原始信息[编辑列时渲染编辑项]
const columnStruct = reactive<Array<ColumnStruct>>([]);
// { title: '列名', dataIndex: 'name', key: '1', width: 150 },
// 表列的表头精简信息信息[渲染列表格]
const columns = reactive<Array<any>>([]);
// 表列数据[渲染表数据]
const data = reactive<Array<any>>([]);
const editColumn = ref<any>({});
const viewModel = new TableDetailViewModel(props.tableName, props.isViewApi);
// 搜索
const showSearchFromEdit = ref(false);
const searchColumns: ColumnStruct[] = reactive([]);
let loadPage: ((pIndex?: number, size?: number) => Promise<void>) | null = null;
const pagination: TablePaginationConfig = reactive({
  total: 250,
  current: 0,
  pageSize: 30,
  showSizeChanger: true,
  showTotal: (totalCount: number) => {
    return `共${totalCount}条`;
  },
  onChange: (pIndex: number) => {
    if (loadPage != null) {
      loadPage(pIndex, pagination.pageSize);
    }
  },
  onShowSizeChange: (current: number, size: number) => {
    if (loadPage != null) {
      loadPage(1, size);
    }
  },
});
const handlePageChange = (param: any) => {
  if (param.type === 'current') {
    if (loadPage != null) {
      loadPage(param.currentPage, pagination.pageSize);
    }
  } else if (param.type === 'size') {
    if (loadPage != null) {
      loadPage(1, param.pageSize);
    }
  }
};
const uploadChange = (r: UploadChangeParam<UploadFile<ApiResultModel<ImportExcelResult>>>) => {
  const resp = r.file.response;
  if (resp && resp?.StatusCode !== 0) {
    message.error(resp?.ErrorMessage);
    return;
  }
  if (resp && resp?.Data?.UpdateCount !== undefined) {
    message.success(`已更新数据${r.file.response?.Data?.UpdateCount ?? 0}条`);
    loadPage && loadPage(1, pagination.pageSize);
  }
};
loadPage = async (pIndex?: number, size?: number) => {
  loadIng.value = true;
  try {
    const pageList = await viewModel.loadTableData({
      pageSize: pagination.pageSize,
      pageIndex: pIndex,
    });
    data.length = 0;
    // const primKeys = viewModel.tabColumnStruct.Where(itemObj => {
    //   return itemObj?.IsPrimary ?? false;
    // });
    pageList?.List.forEach((r, index) => {
      data.push({ ...r, hiRowKey: `${index}` });
    });
    // data.push(...(pageList?.List ?? []));
    pagination.total = pageList?.TotalCount ?? 0;
  } catch (error) {
    // console.error(error);
    // message.error(`数据加载失败!`);
  }
  loadIng.value = false;
  pagination.current = pIndex;
  pagination.pageSize = size;
  console.log(pagination);
  if (xTable.value) {
    xTable.value.loadData(data);
  }
};

(async () => {
  await viewModel.loadTableInfo();
  columnStruct.push(...viewModel.tabColumnStruct.ToArray());
  columnStruct.forEach(r => {
    if (r.ShowDataList) {
      columns.push({
        title: r.FieldDesc,
        dataIndex: r.FieldName,
        width: 150,
      });
    }
  });
  if (columns.length === 0) {
    // 没有任何列
    columnStruct.forEach(r => {
      columns.push({
        title: r.FieldDesc,
        dataIndex: r.FieldName,
        width: 150,
      });
    });
  }
  if (!props.isViewApi) {
    columns.push({
      title: '设置',
      dataIndex: '',
      key: 'x',
      width: 100,
      fixed: 'right',
      slots: {
        customRender: 'action',
      },
    });
  }
  searchColumns.push(...getSearchColumns(viewModel.tabColumnStruct.ToArray()));
  loadPage(1, pagination.pageSize);
})();
let isAddColumn = false;
const saveFrom = async (columnData: any) => {
  viewModel
    .SaveTableData(columnData, isAddColumn)
    .then(isOK => {
      loadPage && loadPage(1, pagination.pageSize);
      message.success(`保存成功!`);
    })
    .catch(error => {
      message.error(error);
    })
    .finally(() => {
      showFromEdit.value = false;
    });
};
/**
 * 删除列
 * @param columnData
 */
const deleteDataColumn = async (columnData: any) => {
  Modal.confirm({
    content: '您确定要删除吗',
    icon: createVNode(ExclamationCircleOutlined),
    async onOk() {
      const deleteResult = await viewModel.deleteDataColumn(columnData);
      if (deleteResult.Data?.IsOk) {
        loadPage && loadPage(pagination.current, pagination.pageSize);
        message.success(`已删除!`);
      } else {
        message.error(`删除失败!\r\n${deleteResult.Data?.Message ?? ``}`);
      }
    },
    cancelText: '取消',
    okText: '确认',
    onCancel() {},
  });
};

const openColumnSetting = (record: any) => {
  if (!viewModel) {
    return;
  }
  if (record == null) {
    isAddColumn = true;
    editColumn.value = {};
  } else {
    isAddColumn = false;
  }
  // saveFun = (rowData: any) => {
  //   return viewModel.saveRowData(rowData);
  // };
  showFromEdit.value = true;
  fromEditTitle.value = `列属性`;
  fromEditPropStruct.length = 0;
  fromEditPropStruct.push(...viewModel.tabColumnStruct.ToArray());
  fromEditColumnObj.value = unref(record ?? {});
};
const openFilter = async () => {
  showSearchFromEdit.value = true;
};
const searchData = async (searchParam: any) => {
  showSearchFromEdit.value = false;
  // viewModel.setSearchData(searchParam);
  viewModel.searchHiParamObj = searchParam;
  if (loadPage != null) {
    await loadPage(1, pagination.pageSize);
  }
};
const showDelete = ref(false);
const selectedTableRows = ref<Array<any>>([]);
// const rowSelection = {
//   onChange: (selectedRowKeys: string[], selectedRows: any[]) => {
//     showDelete.value = selectedRowKeys.length > 0;
//     selectedTableRows.value = selectedRows;
//   },
//   getCheckboxProps: (record: any) => ({
//     disabled: false, // Column configuration not to be checked
//   }),
// };
const rowSelectionCheck = () => {
  const selectedRows = xTable.value.getCheckboxRecords();
  showDelete.value = selectedRows.length > 0;
  selectedTableRows.value = selectedRows;
};

const batchDelete = async () => {
  if (selectedTableRows.value.length < 1) {
    message.warn(`请选择要删除的行!`);
    return;
  }
  const deleteSuccess = await viewModel.batchDeleteColumn(selectedTableRows.value);
  if (deleteSuccess) {
    showDelete.value = false;
    loadPage && loadPage(1, pagination.pageSize);
    message.success(`删除成功!`);
    selectedTableRows.value = [];
  } else {
    message.error(`删除失败!`);
  }
};

const exportQueryData = async (key: exportType) => {
  const taskId = await viewModel.ExportQueryData(key);
  const taskObj = new ExportTaskInfoModel();
  taskObj.TaskId = taskId;
  taskObj.TalbeName = viewModel.tableName;
  taskObj.UpdateTime = new Date();
  store.dispatch('addExportTask', taskObj);
};

const clearTable = async () => {
  Modal.confirm({
    content: '再次确认要清空表吗?不可恢复哦!!!',
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {},
    cancelText: '一定要清空',
    okText: '取消',
    async onCancel() {
      await viewModel.ClearTable();
      if (loadPage) {
        await loadPage();
      }
    },
  });
};
</script>

<style lang="less" scoped>
.wrapPanel {
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 230px);
}

.topPanel {
  color: red;
  position: relative;
  height: 100%;
}

.buttomPanel {
  position: fixed;
  width: 100%;
  bottom: 0;
  height: 300px;
}

.ant-card-extra {
  .ant-btn {
    margin-left: 20px;
  }
}

::v-deep(.ant-table) {
  border-top: solid 1px #eee;
  border-left: solid 1px #eee;
}

::v-deep(.ant-card-extra) {
  display: flex;
}
</style>
<style lang="less">
.tableData {
  .ant-card {
    position: relative;
    height: 100%;

    .ant-card-body {
      position: absolute;
      width: 100%;
      height: calc(100% - 50px);
    }

    .ant-table-body {
      max-height: calc(100vh - 400px) !important;
    }
  }
}

.ant-table-small .ant-table-thead > tr > th {
  background: #f2f3f7;
}

::v-deep(.ant-card-small > .ant-card-head) {
  border: none !important;
}
</style>
