<template>
  <template v-if="viewModel.isLoading">
    <div class="w-full h-[calc(100vh-212px)] flex flex-row justify-center items-center">
      <a-spin size="large" />
    </div>
  </template>
  <template v-else>
    <div class="wrapPanel">
      <div class="cardInfo">
        <div class="cHeader">
          <div class="text-16px flex justify-start items-center">
            <span class="mr-10px" v-text="viewModel.isAddTableModel ? `新建表名:` : `表名:`" />
            <template v-if="viewModel.isAddTableModel">
              <div>
                <a-input v-model:value="viewModel.tableName" placeholder="请输入纯英文表名..." />
              </div>
              <a-checkbox
                v-model:checked="viewModel.addDefaultField"
                class="!ml-10px"
                @change="addDefaultFieldChange"
              >
                添加标准字段
              </a-checkbox>
            </template>
            <template v-else>
              <span v-text="viewModel.tableName" />
            </template>
          </div>
          <div class="flex w-300px justify-end">
            <a-button
              v-if="!isViewApi"
              class="mr-10px"
              type="primary"
              @click="openColumnSetting(null)"
            >
              <PlusCircleOutlined />
              增加列
            </a-button>
            <h-ref-table
              v-if="!isViewApi"
              :hide-select-value="true"
              :column-struct="SelectTable"
              @change="
              (tableName: string) => {
                viewModel.copyTableColumn(tableName);
              }
            "
            >
              <a-button v-if="!isViewApi" class="mr-10px">
                <hi-icon class="text-16px" icon-name="icon-copy1" />
                复制表列
              </a-button>
            </h-ref-table>

            <!-- <a-button v-if="!isViewApi" @click="openTableSetting">
              <setting-outlined key="setting" />
              设置
            </a-button> -->
            <a-button :disabled="!viewModel.tableHasChange" @click="saveTableInfo()">
              <hi-icon class="text-16px" icon-name="icon-baocun1" />
              {{ saveBtnText }}
            </a-button>
          </div>
        </div>
        <div class="cBody">
          <div class="tableWraper">
            <table class="tableStruct">
              <thead>
                <td class="td0"></td>
                <td class="tdA">
                  <span>列名</span>
                </td>
                <td class="tdA">
                  <span>列描述</span>
                </td>
                <td class="tdA">
                  <span>数据类型</span>
                </td>
                <td v-if="!isViewApi" class="tdB">
                  <span>是否可空</span>
                </td>
                <td v-if="!isViewApi" class="tdB">
                  <span>是否主键</span>
                </td>
                <td class="tdB">
                  <span>列表显示</span>
                </td>
                <td class="tdC">操作</td>
              </thead>
            </table>
            <div class="tableStructBody" @click="editCell.field = ``">
              <table>
                <tbody>
                  <tr v-for="(colData, index) in viewModel.tableFields" :key="index">
                    <td class="td0">
                      <hi-icon
                        v-if="colData.IsPrimary"
                        class="relative left-4px"
                        :icon-name="`icon-key1`"
                      />
                    </td>
                    <td class="tdA" @click.stop>
                      <a-input
                        v-if="editCell.rowObj == colData && editCell.field == `FieldName`"
                        v-model:value="colData.FieldName"
                        placeholder="请输入..."
                        @change="viewModel.tableHasChange = true"
                        @blur="editCell.field = ``"
                      />
                      <span
                        v-else
                        @dblclick="openEditCell(colData, `FieldName`)"
                        v-text="colData.FieldName"
                      ></span>
                    </td>
                    <td class="tdA" @click.stop>
                      <a-input
                        v-if="editCell.rowObj == colData && editCell.field == `FieldDesc`"
                        v-model:value="colData.FieldDesc"
                        placeholder="请输入..."
                        @change="viewModel.tableHasChange = true"
                        @blur="editCell.field = ``"
                      />
                      <span
                        v-else
                        @dblclick="openEditCell(colData, `FieldDesc`)"
                        v-text="colData.FieldDesc"
                      ></span>
                    </td>
                    <td class="tdA" @click.stop @dblclick="openEditCell(colData, `FieldType`)">
                      <a-select
                        v-if="editCell.rowObj == colData && editCell.field == `FieldType`"
                        v-model:value="colData.FieldType"
                        class="w-130px"
                        size="small"
                        @change="viewModel.tableHasChange = true"
                      >
                        <a-select-option
                          v-for="(typeObj, subIndex) in dataTypes"
                          :key="subIndex"
                          v-model:value="typeObj.value"
                        >
                          {{ typeObj.text }}
                        </a-select-option>
                      </a-select>
                      <span v-else v-text="DataBaseType[colData.FieldType]" />
                    </td>
                    <td v-if="!isViewApi" class="tdB">
                      <CheckBox
                        v-model:value="colData.IsNull"
                        @change="viewModel.tableHasChange = true"
                      />
                    </td>
                    <td v-if="!isViewApi" class="tdB">
                      <CheckBox
                        v-model:value="colData.IsPrimary"
                        @change="viewModel.tableHasChange = true"
                      />
                    </td>
                    <td class="tdB">
                      <CheckBox
                        v-model:value="colData.ShowDataList"
                        @change="viewModel.tableHasChange = true"
                      />
                    </td>
                    <td class="tdC">
                      <edit-outlined
                        class="editable-cell-icon"
                        @click="openColumnSetting(colData)"
                      />
                      <a-popconfirm
                        v-if="!isViewApi"
                        title="您确定要删除列吗?"
                        ok-text="是"
                        cancel-text="否"
                        @confirm="deleteColumn(colData)"
                      >
                        <delete-outlined class="editable-cell-icon" />
                      </a-popconfirm>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- <a-card size="small" :title="`表名:${tableName}`">
          <template #extra>

          </template>

        </a-card> -->
      </div>
    </div>
    <a-drawer
      v-model:visible="showFromEdit"
      width="600"
      :title="fromEditTitle"
      placement="right"
      :closable="true"
    >
      <template #extra>
        <a-button type="primary" @click="saveFrom">确认修改</a-button>
      </template>
      <FromEdit
        v-if="showFromEdit"
        :ref="
      (el: any) => {
        viewModel.FromEditObj = el;
      }"
        :tab-columns="fromEditPropStruct"
        :tab-column-data="fromEditColumnObj"
        :closable="true"
        :is-add-table="viewModel.isAddTableModel"
      />
    </a-drawer>
    <!-- <a-drawer
      v-model:visible="showFromEdit"
      width="600"
      :title="fromEditTitle"
      placement="right"
      :closable="true"
    >
      <a-input v-model:value="viewModel.tableName" placeholder="请输入表名..." />
    </a-drawer> -->
  </template>
</template>
<script lang="ts" setup>
import {
  DeleteOutlined,
  SettingOutlined,
  PlusCircleOutlined,
  EditOutlined,
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import FromEdit from '../columsTypes/fromEdit/fromEdit.vue';
import TableDetailViewModel, { dataTypes, SelectTable } from './tableStructViewModel';
import { ColumnStruct } from '../../serverApi/models/columnStruct';
import { DataBaseType } from '../columsTypes/fromEdit/fromEditViewModel';
import CheckBox from '../columsTypes/checkBox.vue';
import { store } from '@/store';
import tableFieldMap from '../tableFieldMap/tableFieldMap.vue';
import hiIcon from '../Icon/hiIcon.vue';

const emits = defineEmits([`createNewTable`, `tableChange`]);
const showFromEdit = ref(false);
const fromEditTitle = ref(``);
const fromEditPropStruct = reactive<Array<ColumnStruct>>([]);
const fromEditColumnObj = ref<any>({});
const saveBtnText = ref('保存');
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

// const editColumn = ref<any>({});
/**
 * 编辑单元格
 */
const editCell = reactive({
  rowObj: {},
  field: ``,
});
const viewModel = reactive(new TableDetailViewModel(props.tableName, props.isViewApi));
const addDefaultFieldChange = () => {
  viewModel.refreshData();
};
// const searchColumns: ColumnStruct[] = reactive([]);

// const checkBoxChange = (colData: any, filedName: string, v: any, v2: any) => {
//   // colData[filedName] = v.target.checked;
// };
const openEditCell = (colData: any, fieldName: string) => {
  editCell.rowObj = colData;
  editCell.field = fieldName;
};
let saveFun: (rowData: any) => Promise<void> = async () => {};
// const openTableSetting = () => {
//   showFromEdit.value = true;
//   fromEditTitle.value = `表属性`;
//   fromEditPropStruct.length = 0;
//   saveFun = (rowData: any) => {
//     return viewModel.saveRowData(rowData);
//   };
//   fromEditPropStruct.push(...(viewModel.tableInfo?.TabPropStruct ?? []));
//   fromEditColumnObj.value = unref(viewModel.tableInfo?.TabProps ?? {});
//   console.info(showFromEdit.value);
// };
const openColumnSetting = (record: ColumnStruct | null) => {
  const newColumnObj = new ColumnStruct();
  debugger;
  let isAdd = false;
  if (record == null) {
    isAdd = true;
    newColumnObj.TabName = viewModel.tableName;
    newColumnObj.FieldLen = 50;
    record = newColumnObj;
  }
  saveFun = async (rowData: ColumnStruct) => {
    debugger;
    if (isAdd) {
      viewModel.tableInfo?.TabColumns.push(rowData);
      viewModel.refreshData();
    } else {
      Object.assign(record ?? {}, rowData);
    }
    viewModel.tableHasChange = true;
  };
  showFromEdit.value = true;
  fromEditTitle.value = `列属性`;
  fromEditPropStruct.length = 0;
  fromEditPropStruct.push(...(viewModel.tableInfo?.TabColumnStruct ?? []));
  fromEditColumnObj.value = unref(record ?? {});
};
const deleteColumn = (column: ColumnStruct) => {
  viewModel.deleteColumn(column);
};

const saveTableInfo = async () => {
  if (viewModel.isSaveing) {
    return;
  }
  viewModel.isSaveing = true;
  viewModel.tableHasChange = true;
  saveBtnText.value = `保存中...`;

  viewModel
    .saveTable()
    .then(saveResult => {
      if (saveResult?.IsOk) {
        viewModel.tableHasChange = false;
        message.success(`保存成功!`);
        if (viewModel.isAddTableModel) {
          emits(`createNewTable`, viewModel.tableName);
        } else {
          viewModel.load();
          emits(`tableChange`, viewModel.tableName);
        }
      } else {
        message.error(`保存失败!\r\n原因:${saveResult?.Message}\r\n执行SQL:${saveResult?.Sql}`);
      }
    })
    .catch(err => {
      message.error(err);
    })
    .finally(() => {
      saveBtnText.value = `保存`;
    });

  viewModel.isSaveing = false;
};
const saveFrom = async () => {
  const columnData = await viewModel.FromEditObj?.Save();
  debugger;
  if (columnData) {
    showFromEdit.value = false;
    await saveFun(columnData);
  }
};

viewModel
  .load()
  .catch(err => {
    message.error(err);
  })
  .finally(() => {
    viewModel.isLoading = false;
  });
</script>

<style lang="less" scoped>
.wrapPanel {
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 212px);
  overflow: auto;
  @tablebordercolor: #f0f0f0;
  padding: 10px;

  .tableWraper {
    position: relative;
    width: 100%;
    height: 100%;
    border-top: solid 1px @tablebordercolor;

    .td0 {
      width: 30px;
    }

    .tdA {
      width: 220px;

      span {
        width: 100%;
        display: block;
        overflow: hidden;
      }
    }

    .tdB {
      width: 100px;
    }

    .tdC {
      width: 60px;
      text-align: center;

      .editable-cell-icon:last-child {
        margin-right: 0;
      }
    }
  }

  .tableStruct {
    border: solid 1px @tablebordercolor;
    border-top: none;
    position: absolute;
    left: 0;
    top: 0;
    background-color: #fafafa;
    z-index: 10;

    td {
      padding: 5px 5px;
      border-right: solid 1px @tablebordercolor;
      border-bottom: solid 1px @tablebordercolor;
    }
  }

  .tableStructBody {
    padding-top: 33px;
    max-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    border-right: solid 1px @tablebordercolor;
    border-bottom: solid 1px @tablebordercolor;

    .editable-cell-icon {
      cursor: pointer;
      margin-right: 10px;
    }

    td {
      padding: 5px 5px;
      border-right: solid 1px @tablebordercolor;
      border-bottom: solid 1px @tablebordercolor;
      border-left: solid 1px @tablebordercolor;
    }
  }

  .tableStructBody tr:last-child td {
    border-bottom: none;
  }
}

.buttomPanel {
  position: fixed;
  width: 100%;
  bottom: 0;
  height: 300px;
}

.cardInfo {
  width: 100%;
  height: 100%;
  @headHeight: 40px;

  .cHeader {
    height: @headHeight;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .cBody {
    position: relative;
  }
}

.ant-card-extra {
  .ant-btn {
    margin-left: 20px;
  }
}

.ant-card {
  position: relative;
  height: 100%;

  .ant-card-body {
    position: absolute;
    width: 100%;
    height: calc(100% - 50px);
  }

  .ant-table-body {
    max-height: calc(100vh - 333px) !important;
  }
}

::v-deep(.ant-card-small > .ant-card-head) {
  border: none !important;
}
</style>
