<template>
  <div class="w-full h-full">
    <div class="body box-border overflow-hidden flex flex-row w-full h-full">
      <div
        v-if="!isEdit"
        class="w-300px h-full overflow-hidden border-r-1px border-[#eeeeee] flex flex-col pr-20px"
      >
        <div class="overflow-hidden">
          <div class="float-left h-32px leading-32px text-size-[#191919]">已选数据表</div>
          <div class="float-right">
            <h-ref-table
              :value="refTableValue"
              :hide-select-value="true"
              :column-struct="SelectTable"
              :is-multi-value="true"
              @change="
                (tableName:string) => {
                 selectTables(tableName);
                }
              "
            >
              <a-button class="mr-10px">
                <PlusCircleOutlined />
                添加表
              </a-button>
            </h-ref-table>
          </div>
        </div>
        <div class="w-full flex-1 flex flex-col overflow-hidden mt-15px">
          <div class="h-40px leading-40px bg-[#F2F3F7] flex flex-row px-10px box-border">
            <div class="w-60px">序号</div>
            <div class="flex-1">表名</div>
            <div class="w-60px">操作</div>
          </div>
          <div class="w-full flex-1 overflow-y-auto px-10px box-border">
            <div
              v-for="(item, index) in addTableNameList"
              :key="index"
              class="h-40px leading-40px border-t-1px border-[#eeeeee] cursor-pointer"
            >
              <div class="h-40px flex flex-row">
                <div class="w-60px">{{ index + 1 }}</div>
                <div
                  class="w-[calc(100%-120px)] overflow-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {{ item }}
                </div>
                <div
                  class="w-60px text-right text-size-[#3144F5] cursor-pointer"
                  @click="deleteTable(item)"
                >
                  移除
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 h-full border-[#eeeeee] text-center p-30px box-border overflow-y-auto">
        <div v-for="item in resAuthList" :key="item" class="mb-40px">
          <div class="font-bold text-[16px] text-size-[#666666] mb-15px text-left">
            {{ item.Name }}
          </div>
          <hRefTableSelect
            v-if="isReRender"
            ref="hRefTableSelectRef"
            v-model:value="refValue"
            :ref-config="{
              RefTab: item.RefTab,
              RefTextField: item.RefTextField,
              RefValueField: item.RefField,
              RefWhere: item.RefWhere,
            }"
            :handle-type="item.Name"
            @change="changeValue"
          ></hRefTableSelect>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { PermissionManagementModel } from './permissionManagementModel';
import { SelectTable } from '@/views/hisql/exportExcel/exportExcelViewModel';
import hRefTableSelect from '@/components/columsTypes/hRefTableSelect/hRefTableSelect.vue';
import { Dictionary } from '@/helper/arrayHelper';

const emits = defineEmits([`closedPermissionManagement`]);

const hRefTableSelectRef = ref(null);
const props = defineProps({
  /**
   * 需要配置权限的表
   */
  tableNameList: {
    type: Array<string>,
    required: true,
  },
  /**
   * 选中的模块信息
   */
  selectedType: {
    type: Object,
    required: true,
  },
    /**
   * 是否编辑权限
   */
  isEdit: {
    type: Boolean,
    required: true,
  },
     /**
   * 选择表信息（包含已编辑的权限）
   */
  updateTableNameInfo: {
    type: Object,
    required: true,
  },

});
const addTableNameList = ref<Array<string>>([]); // 新增表名权限，可多个操作
const resAuthList = ref<Array<any>>([]);
const isReRender = ref(true);

const refTableValue = ref();
const refValue = ref();
const selectedPermission = ref<Dictionary<string, any>>({}); // 选中的权限

const viewModel = new PermissionManagementModel();

// 获取资源
const loadResAuthList = async () => {
  resAuthList.value = await viewModel.loadResAuthList(props.selectedType.MId);
  if (resAuthList.value.length > 0) {
    // 资源选择对象
    resAuthList.value.forEach(item => {
      if (item.Name) {
        Object.assign(selectedPermission.value, { [item.Name]: { text: '', value: '' } });
      }
    });
  } else {
    // eslint-disable-next-line no-const-assign
    selectedPermission.value = {};
  }
};
loadResAuthList();
// 刷新资源组件
const reRender = () => {
  isReRender.value = false;
  setTimeout(() => {
    isReRender.value = true;
  });
};

// 选择已配置表名
const selectConfigured = async (item: any) => {
  // eslint-disable-next-line no-use-before-define
  refValue.value = item.RefValues;

  // reRender();
  // 给选中的配置赋值
  const allList = hRefTableSelectRef.value || [];
  const refValueArr = item.RefValues.split(',');
  const refTextArr = item.RefValueText.split(',');
  if (allList && allList.length > 0) {
    allList.forEach((d1: any, i1) => {
      let valueStr = '';
      let textStr = '';
      refValueArr.forEach((d2: any, i2: any) => {
        if (d1.viewData && d1.viewData.optionList && d1.viewData.optionList.length > 0) {
          d1.viewData.optionList.forEach((d3: { Id: any }) => {
            if (d2 === d3.Id) {
              valueStr += `,${d2}`;
              textStr += `,${refTextArr[i2]}`;
            }
          });
        }
      });
      selectedPermission.value[resAuthList.value[i1].Name].value = valueStr.substring(
        1,
        valueStr.length,
      );
      selectedPermission.value[resAuthList.value[i1].Name].text = textStr.substring(
        1,
        textStr.length,
      );
    });
  }
};
// eslint-disable-next-line vue/no-setup-props-destructure
addTableNameList.value = props.tableNameList;
refTableValue.value =props.tableNameList.toString();
// 如果是编辑，只能编辑单个权限，批量编辑是重新编辑权限
if(props.isEdit){
  selectConfigured(props.updateTableNameInfo);
}else{
// 不是单个编辑，就是批量操作，需要清空选中的配置资源
    refValue.value = '';
     reRender();
}

// 选择新增的表名
const selectTables = (tableNames: string) => {
  if (tableNames && tableNames !== undefined) {
    addTableNameList.value = tableNames.split(',');
    refTableValue.value=tableNames;
  } else {
    addTableNameList.value = [];
  }
  refValue.value = '';
  reRender();
};

// 移除新增的表名
const deleteTable = (item: string) => {
  addTableNameList.value = addTableNameList.value.filter(e => {
    return e !== item;
  });
};
// 勾选资源
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const changeValue = (v1: string, v2: string, handleType: string) => {
  for (const key in selectedPermission.value) {
    if (Object.prototype.hasOwnProperty.call(selectedPermission.value, key)) {
      if (key === handleType) {
        const element = selectedPermission.value[key];
        if (v1 && v2) {
          element.value = v1;
          element.text = v2;
        } else {
          element.value = '';
          element.text = '';
        }
      }
    }
  }
};
defineExpose({ addTableNameList, selectedPermission });
</script>

<style lang="less" scoped>
.active {
  background-color: #eff0f9;
  color: #3144f5;
}
</style>
