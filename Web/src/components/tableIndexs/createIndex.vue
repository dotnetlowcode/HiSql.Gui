<template>
  <a-drawer
    :visible="true"
    width="400"
    class="custom-class"
    title="选择索引创建列"
    placement="right"
    @close="closeSelf"
  >
    <template #extra>
      <a-button type="primary" @click="saveIndex">保存索引</a-button>
    </template>
    <div class="columsWaper">
      <table class="tableStruct">
        <thead>
          <td>选择</td>
          <td>数据列</td>
          <td class="min-w-150px">列描述</td>
        </thead>
        <tbody>
          <tr v-for="(columnObj, index) in columnList" :key="index">
            <td class="text-center">
              <a-checkbox v-model:checked="columnObj.Checked"></a-checkbox>
            </td>
            <td><span v-text="columnObj.FieldName"></span></td>
            <td><span v-text="columnObj.FieldDesc"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue';
import { List } from 'linqts';
import { apiError, getTableColumns, createTableIndex } from '@/serverApi/tableInfoAPIs';
import { TableGetColumnsRequest } from '@/serverApi/request/table/tableGetColums';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

const emits = defineEmits([`close`]);
const props = defineProps({
  tableName: {
    required: true,
    type: String,
  },
});

const columnList = reactive<Array<ColumnStruct & { Checked: boolean }>>([]);
(async function init() {
  const req = new TableGetColumnsRequest();
  req.TableName = props.tableName;
  const { Data: data } = await getTableColumns(req);
  if (!data) {
    throw apiError;
  }
  data.TabColumnStruct.forEach(columnObj => {
    columnList.push({
      ...columnObj,
      Checked: false,
    });
  });
})();
const closeSelf = () => {
  emits(`close`);
};
const saveIndex = async () => {
  const selectField: Array<ColumnStruct> = [];
  columnList.forEach(r => {
    if (r.Checked) {
      selectField.push(r);
    }
  });
  if (selectField.length === 0) {
    message.warning(`请至少选择一列!`);
    return;
  }
  const indexName = new List(selectField)
    .Select(r => r.FieldName)
    .ToArray()
    .join(`_`);
  const saveResult = await createTableIndex(props.tableName, indexName, selectField);
  if (saveResult?.IsOk) {
    message.success(`保存成功!`);
    closeSelf();
  } else {
    message.error(`保存失败!${saveResult?.Message}`);
  }
};
</script>
<style lang="less" scoped>
.columsWaper {
  position: relative;
}
.tableStruct {
  border: solid 1px @tablebordercolor;
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
@tablebordercolor: #f0f0f0;
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
</style>
