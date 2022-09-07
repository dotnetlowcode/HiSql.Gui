<template>
  <a class="settingBtn" @click="showDialogSelect = true">设置</a>
  <span class="valueSpan" v-text="textValue" />
  <a-drawer
    v-if="showDialogSelect"
    :visible="showDialogSelect"
    width="700"
    title="条件设置"
    placement="right"
    :closable="true"
    @close="showDialogSelect = false"
  >
    <div class="operateBtns">
      <a-button type="primary" @click="addWhereItem()">
        <PlusCircleOutlined />
        增加
      </a-button>
      <a-button type="primary" @click="saveWhere">
        <CheckOutlined />
        保存
      </a-button>
    </div>
    <div>
      条件预览:
      <p class="preWhereStr" v-text="getWhereStr()"></p>
    </div>
    <a-table
      size="small"
      :bordered="true"
      :pagination="false"
      :data-source="tableData"
      :scroll="{ x: 'max-content', y: 'max-content' }"
      :columns="tableColumnStruct"
    >
      <template #whereField="{ record }">
        <!-- <a-input v-model:value="record.whereField" /> -->
        <a-select
          v-model:value="record[`whereField`]"
          style="width: 150px"
          @change="fieldChange(record, $event as any)"
        >
          <a-select-option v-for="(mValue, key) in fileds" :key="key" :value="mValue.FieldName">
            {{ mValue.FieldName }}
          </a-select-option>
        </a-select>
      </template>
      <template #whereValue="{ record }">
        <!-- <a-input v-if="record[`whereOperate`] == `=`" v-model:value="record.whereValue" />
        <a-input-number v-else v-model:value="record.whereValue"></a-input-number> -->
        <columnsRender :param="record.fieldStruct" @column-update="v => updateValue(record, v)" />
      </template>
      <template #whereOperate="{ record }">
        <a-select
          v-model:value="record[`whereOperate`]"
          :disabled="record.whereOperateDisable"
          style="width: 100px"
        >
          <a-select-option v-for="(mValue, key) in whereOperateMap" :key="key" :value="mValue">
            {{ key }}
          </a-select-option>
        </a-select>
      </template>
      <template #whereJoin="{ record }">
        <a-select v-model:value="record[`whereJoin`]" style="width: 70px">
          <a-select-option v-for="(mValue, key) in whereJoinMap" :key="key" :value="mValue">
            {{ key }}
          </a-select-option>
        </a-select>
      </template>
      <template #itemOperate="{ record }">
        <a-button type="link" @click="removeWhereItem(record)">
          <DeleteOutlined />
        </a-button>
      </template>
    </a-table>
  </a-drawer>
</template>

<script setup lang="ts">
import { List } from 'linqts';
import { PlusCircleOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import {
  whereOperateMap,
  whereJoinMap,
  typeOfTableData,
  whereStrToObj,
  typeOfTableRow,
  restRecord,
} from './whereTableViewModel';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

const tableColumnStruct = ref<
  Array<{
    title: string;
    dataIndex: string;
    width: number;
    slots: any | undefined;
  }>
>([
  {
    title: `条件字段`,
    dataIndex: `whereField`,
    width: 100,
    slots: {
      customRender: 'whereField',
    },
  },
  {
    title: `比较符号`,
    dataIndex: `whereOperate`,
    width: 80,
    slots: {
      customRender: `whereOperate`,
    },
  },
  {
    title: `条件值`,
    dataIndex: `whereValue`,
    width: 100,
    slots: {
      customRender: 'whereValue',
    },
  },
  {
    title: `条件连接`,
    dataIndex: `whereJoin`,
    width: 80,
    slots: {
      customRender: 'whereJoin',
    },
  },
  {
    title: `操作`,
    width: 50,
    dataIndex: 'itemOperate',
    slots: {
      customRender: 'itemOperate',
    },
  },
]);
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  /**
   * 条件列集合
   */
  tableColumnsStruct: {
    validator(value) {
      return Array.isArray(value) && value.length > 0;
    },
    type: Array as () => Array<ColumnStruct>,
    required: true,
  },
});
const showDialogSelect = ref(false);
const textValue = ref(props.value ?? ``);
const tableData = reactive<typeOfTableData>(
  whereStrToObj(textValue.value, props.tableColumnsStruct),
);
// const fileds = reactive<
//   Array<{
//     FieldName: string;
//     FieldDesc: string;
//   }>
// >([]);
let defaultField = ``;
const fileds = computed(() => {
  const tempFields: Array<{
    FieldName: string;
    FieldDesc: string;
  }> = [];
  props.tableColumnsStruct?.forEach((r, i) => {
    if (i === 0) {
      defaultField = r.FieldName;
    }
    tempFields.push({
      FieldName: r.FieldName,
      FieldDesc: r.FieldDesc,
    });
  });
  return tempFields;
});
console.log(fileds);
const addWhereItem = () => {
  if (props.tableColumnsStruct.length === 0) {
    return;
  }
  let fieldType = new List(props.tableColumnsStruct).FirstOrDefault(
    r => r?.FieldName === defaultField,
  );
  if (!fieldType) {
    // eslint-disable-next-line prefer-destructuring
    fieldType = props.tableColumnsStruct[0];
  }
  let addRow: typeOfTableRow = {
    whereField: defaultField,
    whereOperate: '=',
    whereValue: ``,
    whereJoin: `and`,
    fieldStruct: reactive(new ColumnsRenderParam({}, fieldType, props.tableColumnsStruct)),
    whereOperateDisable: false,
  };
  addRow = restRecord(addRow);
  tableData.push(reactive(addRow));
};
const removeWhereItem = (record: any) => {
  new List(tableData).Remove(record);
};
const emit = defineEmits([`change`]);
const whereStr = ref(``);
const getWhereStr = () => {
  let str = ``;
  tableData.forEach((k, i) => {
    str += `${k.whereField}${k.whereOperate}${k.whereValue} `;
    if (i !== tableData.length - 1) {
      str += `${k.whereJoin} `;
    }
  });
  whereStr.value = str;
  return str || `暂无`;
};
const saveWhere = () => {
  textValue.value = whereStr.value;
  emit(`change`, whereStr.value);
  showDialogSelect.value = false;
};
const updateValue = (formData: typeOfTableRow, p: { fieldName: string; value: any }) => {
  // emit(`change`, p.value);
  // fromData
  // console.info(`参数`, p);
  // debugger;
  // formData.value[p.fieldName] = p.value;
  console.info(`调试输出`);
  console.info(formData);
  formData.whereValue = p.value;
};
// const tableColumnList = new List(unref(props.tableColumnsStruct));
const fieldChange = (record: typeOfTableRow, fieldName: string) => {
  for (let index = 0; index < props.tableColumnsStruct.length; index++) {
    const element = props.tableColumnsStruct[index];
    if (element.FieldName === fieldName) {
      record.fieldStruct.columnStruct = element;
      record = restRecord(record);
      break;
    }
  }
  // debugger;
  // const fieldType = tableColumnList.FirstOrDefault(r => r?.FieldName === fieldName);
};
</script>

<style lang="less" scoped>
.ant-drawer-body {
  height: calc(100% - 55px);
  overflow: auto;
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
  }
  .preWhereStr {
    border-radius: 5px;
    border: solid 1px #ccc;
    padding: 10px;
    background-color: #f5f5f5;
    margin-top: 5px;
    min-height: 30px;
  }
  .operateBtns {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }
  .settingBtn {
    margin-right: 10px;
  }
}
</style>
