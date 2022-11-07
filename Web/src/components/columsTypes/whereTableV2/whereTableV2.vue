<template>
  <!-- <a class="settingBtn" @click="showDialogSelect = true">设置</a>
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

  </a-drawer> -->
  <!-- <div class="operateBtns">
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
  </div> -->
  <div class="h-full overflow-hidden flex flex-col">
    <div class="relative">
      <a class="ant-dropdown-link h-40px leading-40px" @click="isShowFilter = !isShowFilter">
        <PlusOutlined />
        添加筛选条件
      </a>
      <div
        v-if="isShowFilter"
        class="max-h-300px w-[80/100] absolute left-0 top-40px z-20 flex flex-row"
      >
        <a-select
          v-model:value="whereFieldsList"
          style="width: 350px"
          mode="multiple"
          :max-tag-count="1"
          @change="fieldChangeArr"
        >
          <a-select-option v-for="(mValue, key) in fileds" :key="key" :value="mValue.FieldName">
            {{ mValue.FieldDesc }} ( {{ mValue.FieldName }})
          </a-select-option>
        </a-select>
        <a
          class="ant-dropdown-link h-32px leading-32px w-50px ml-10px"
          @click="isShowFilter = false"
        >
          隐藏
        </a>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto mt-20px">
      <div v-for="(item, index) in tableData" :key="item.whereField" class="mt-20px">
        <div class="overflow-hidden">
          <div class="float-left h-30px leading-30px">{{ item.whereFieldDesc }}</div>
          <div
            v-if="item.fieldType !== DataBaseType.bool && item.isRefTab !== true"
            class="float-left ml-20px"
          >
            <a-select
              v-model:value="item[`whereOperate`]"
              :disabled="item.whereOperateDisable"
              style="width: 100px"
              @change="selectedWhereOperate($event, index)"
            >
              <a-select-option
                v-for="(mValue, key) in getReturnList(item, whereOperateMap)"
                :key="key"
                :value="mValue"
              >
                {{ key }}
              </a-select-option>
            </a-select>
          </div>
          <div class="float-right">
            <a-button type="link" @click="removeWhereItem(item)">
              <DeleteOutlined />
            </a-button>
          </div>
        </div>
        <div v-if="item.fieldStruct" class="mt-10px">
          <template v-if="item.fieldType === DataBaseType.bool || item.isRefTab === true">
            <ColumnsRender
              :param="item.fieldStruct"
              :is-multi-value="item.isMultiValue"
              @column-update="v => updateValue(item, v)"
            />
          </template>
          <template v-else>
            <ColumnsRender
              style="width: 100%"
              :param="item.fieldStruct"
              :is-multi-value="item.isMultiValue"
              @column-update="v => updateValue(item, v)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons-vue';
import {
  whereOperateMap,
  typeOfTableRow,
  whereQueryCondition,
  whereOperate,
} from './whereTableViewModelV2';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';
import { SearchFromVue } from '../searchFrom/searchFromViewModel';
import { DataBaseType } from '../fromEdit/fromEditViewModel';

const whereFieldsList = ref();
const isShowFilter = ref(false);
const props = defineProps({
  // value: {
  //   type: String,
  //   required: true,
  // },
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

const tableData = ref();
const fileds = computed(() => {
  const tempFields: Array<{
    FieldName: string;
    FieldDesc: string;
  }> = [];
  props.tableColumnsStruct?.forEach((r, i) => {
    if (i === 0) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // defaultField = r.FieldName;
    }
    tempFields.push({
      FieldName: r.FieldName,
      FieldDesc: r.FieldDesc,
    });
  });
  return tempFields;
});

const fieldChangeArr = () => {
  tableData.value = whereQueryCondition(whereFieldsList.value, props.tableColumnsStruct);
};

const selectedWhereOperate = (e: any, i: number) => {
  if (e === 'between') {
    tableData.value[i].isMultiValue = true;
  } else {
    tableData.value[i].isMultiValue = false;
  }
};

const removeWhereItem = (record: any) => {
  debugger;
  // new List(tableData.value).Remove(record);
  whereFieldsList.value = whereFieldsList.value.filter((r: any) => {
    return r !== record.whereField;
  });

  tableData.value = tableData.value.filter((r: any) => {
    return r.whereField !== record.whereField;
  });
};

const getReturnList = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  item: typeOfTableRow,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  itemObj: {
    [key: string]: whereOperate;
  },
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let obj: {
    [key: string]: whereOperate;
  } = {};

  if (
    item.fieldType === DataBaseType.int ||
    item.fieldType === DataBaseType.bigInt ||
    item.fieldType === DataBaseType.smallInt ||
    item.fieldType === DataBaseType.decimal
  ) {
    for (const key in itemObj) {
      if (Object.prototype.hasOwnProperty.call(itemObj, key)) {
        const element = itemObj[key];
        if (key === '等于' || key === '区间') {
          obj[key] = element;
        }
      }
    }
  } else if (
    item.fieldType === DataBaseType.char ||
    item.fieldType === DataBaseType.nchar ||
    item.fieldType === DataBaseType.guid ||
    item.fieldType === DataBaseType.varchar ||
    item.fieldType === DataBaseType.nvarchar ||
    item.fieldType === DataBaseType.text
  ) {
    for (const key in itemObj) {
      if (Object.prototype.hasOwnProperty.call(itemObj, key)) {
        const element = itemObj[key];
        if (key === '等于' || key === '模糊' || key === '包含' || key === '不包含') {
          obj[key] = element;
        }
      }
    }
  } else if (item.fieldType === DataBaseType.dateTime || item.fieldType === DataBaseType.date) {
    for (const key in itemObj) {
      if (Object.prototype.hasOwnProperty.call(itemObj, key)) {
        const element = itemObj[key];
        if (key === '等于' || key === '区间') {
          obj[key] = element;
        }
      }
    }
  } else if (item.fieldType === DataBaseType.bool) {
    obj = {};
  }

  return obj;
};

/**
 * 拼出查询条件
 */
const getWhereParam = () => {
  let HisqlWhere = ``;
  const HiSqlWhereParam: any = {};

  if (tableData.value && tableData.value.length > 0) {
    tableData.value.forEach(
      (
        k: {
          whereField: any;
          whereOperate: any;
          whereValue: any;
          whereJoin: any;
          fieldType: DataBaseType;
        },
        i: number,
      ) => {
        // 模糊
        if (k.whereOperate === 'like') {
          HisqlWhere += `${k.whereField}${k.whereOperate}@${k.whereField}`;
          if (i !== tableData.value.length - 1) {
            HisqlWhere += ` ${k.whereJoin} `;
          }
          HiSqlWhereParam[`${k.whereField}`] = `%${k.whereValue}%`;
        }
        //  区间
        else if (k.whereOperate === 'between') {
          //

          const starValue = 'starValue';
          const endValue = 'endValue';
          HisqlWhere += `${k.whereField}>@${starValue} and ${k.whereField}<@${endValue}`;
          if (i !== tableData.value.length - 1) {
            HisqlWhere += ` ${k.whereJoin} `;
          }
          const arr = k.whereValue.split(',');
          // eslint-disable-next-line prefer-destructuring
          HiSqlWhereParam[`${starValue}`] = arr[0];
          // eslint-disable-next-line prefer-destructuring
          HiSqlWhereParam[`${endValue}`] = arr[1];
        }
        //  包含
        else if (k.whereOperate === 'in') {
          //
          HisqlWhere += `${k.whereField} ${k.whereOperate} (@${k.whereField})`;
          if (i !== tableData.value.length - 1) {
            HisqlWhere += ` ${k.whereJoin} `;
          }
          const arr = k.whereValue.split(',');
          HiSqlWhereParam[`${k.whereField}`] = arr;
        } //  不包含
        else if (k.whereOperate === 'not in') {
          //
          HisqlWhere += `${k.whereField} ${k.whereOperate} (@${k.whereField})`;
          if (i !== tableData.value.length - 1) {
            HisqlWhere += ` ${k.whereJoin} `;
          }
          const arr = k.whereValue.split(',');
          HiSqlWhereParam[`${k.whereField}`] = arr;
        }
        // 其他
        else {
          HisqlWhere += `${k.whereField} ${k.whereOperate} @${k.whereField}`;
          if (i !== tableData.value.length - 1) {
            HisqlWhere += ` ${k.whereJoin} `;
          }
          HiSqlWhereParam[`${k.whereField}`] = k.whereValue;
          if (k.fieldType === DataBaseType.bool && k.whereValue === '') {
            HiSqlWhereParam[`${k.whereField}`] = true;
          }
        }
      },
    );
  }

  return {
    HisqlWhere,
    HiSqlWhereParam,
  };
};
const updateValue = (formData: typeOfTableRow, p: { fieldName: string; value: any }) => {
  formData.whereValue = p.value;
};
const emit = defineEmits([`search`]);

defineExpose<SearchFromVue>({
  Submit: () => {
    const paramResult = getWhereParam();

    emit(`search`, paramResult);
    return paramResult as any;
  },
});
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
