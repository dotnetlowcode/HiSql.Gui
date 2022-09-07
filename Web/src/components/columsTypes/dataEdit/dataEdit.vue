<template>
  <a-form
    ref="formRef"
    :rules="rules"
    :model="formData"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    class="h-full"
  >
    <div class="dynamicItemsWaper">
      <RecycleScroller
        v-if="fromFields.length > 0"
        v-slot="{ item }"
        class="scroller"
        :items="fromFields"
        :item-size="40"
        key-field="Id"
      >
        <a-form-item
          :ref="`${item.columnStruct.FieldName}`"
          :name="`${item.columnStruct.FieldName}`"
          :label="item.columnStruct.FieldDesc"
        >
          <columnsRender
            v-if="filedIsShow(item.columnStruct)"
            :param="item"
            @column-update="updateValue"
          />
          <span v-else v-text="item.formData[item.columnStruct.FieldName] || `系统自动填写`"></span>
        </a-form-item>
      </RecycleScroller>
    </div>

    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">保存</a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { Ref } from 'vue';
import columnsRender from '../columnsRender/columnsRender.vue';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

const props = defineProps({
  tabColumns: {
    validator(value) {
      return Array.isArray(value) && value.length > 0;
    },
    type: Array as () => Array<ColumnStruct>,
    required: true,
  },
  tabColumnData: {
    required: true,
    type: Object,
  },
});
const formData: Ref<{
  [x: string]: any;
}> = ref({});

const rules: { [key: string]: Array<any> } = {};
const fromFields = reactive<Array<ColumnsRenderParam>>([]);
(() => {
  // debugger;
  // console.info(`tabColumnData`);
  // console.info(props.tabColumnData);
  formData.value = { ...props.tabColumnData };
  // 初始化表单验证规则,目前只加了非空验证,后续可以增加其他规则
  for (let index = 0; index < props.tabColumns.length; index++) {
    const fieldObj = props.tabColumns[index];
    fromFields.push(new ColumnsRenderParam(formData, fieldObj, props.tabColumns, false));
    const fieldRule = [];
    if (fieldObj.IsRequire) {
      fieldRule.push({
        required: true,
        message: `请输入${fieldObj.FieldDesc}`,
        trigger: 'blur',
      });
    }
    // 其他规则后续补充.....
    if (fieldRule.length > 0) {
      rules[fieldObj.FieldName] = fieldRule;
    }
  }
})();

const emits = defineEmits([`save`]);
const formRef = ref();

const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };
const updateValue = (p: any) => {
  // console.info(`参数`, p);
  formData.value[p.fieldName] = p.value;
  // console.info(formData);
};
const filedIsShow = (columnStruct: ColumnStruct) => {
  if (columnStruct.IsIdentity) {
    // 自增主键无需填写
    return false;
  }
  if ([`CreateTime`, `CreateName`, `ModiTime`, `ModiName`].indexOf(columnStruct.FieldName) > -1) {
    return false;
  }
  return true;
};
const onSubmit = () => {
  formRef.value
    .validate()
    .then(() => {
      emits(`save`, formData.value);
      console.info(formData.value);
    })
    .catch((error: any) => {
      console.log('error', error);
    });
};
</script>
<style lang="less" scoped>
.dynamicItemsWaper {
  height: calc(100% - 50px);
}
.scroller {
  height: 100%;
  overflow: auto;
}
</style>
