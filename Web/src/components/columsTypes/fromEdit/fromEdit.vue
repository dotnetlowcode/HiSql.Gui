<template>
  <a-form
    :ref="
      (el:any) => {
        formRef = el;
      }
    "
    :rules="rules"
    :model="formData"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <div>
      <a-tabs v-model:activeKey="activGroup">
        <a-tab-pane
          v-for="fGroup in fieldGroups"
          :key="fGroup.ElementValue"
          :tab="`${fGroup.ElementDesc}配置`"
          force-render
        />
      </a-tabs>
    </div>
    <template v-for="fieldObj in fromFields" :key="fieldObj.columnStruct.FieldName">
      <a-form-item
        v-if="showColumn(fieldObj.columnStruct, formData, activGroup, isAddTable)"
        :ref="`${fieldObj.columnStruct.FieldName}`"
        :name="`${fieldObj.columnStruct.FieldName}`"
        :label="fieldObj.columnStruct.FieldDesc"
      >
        <columnsRender :param="fieldObj" @column-update="updateValue" />
      </a-form-item>
    </template>
  </a-form>
</template>
<script lang="ts" setup>
import { Ref } from 'vue';
import columnsRender from '../columnsRender/columnsRender.vue';
import { fieldGroup, loadFieldGroups, showColumn } from './fromEditViewModel';
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
  isAddTable: {
    required: false,
    tyepe: Boolean,
    default: false,
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
    if (fieldObj.IsRequire && fieldObj.DBDefault !== 10) {
      // 字段为必填且默认值不为String.Empty (N'')
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

const formRef = ref<{
  validate: () => Promise<any>;
}>();

const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };
const updateValue = (p: any) => {
  // console.info(`参数`, p);
  formData.value[p.fieldName] = p.value;
  // console.info(formData);
};

const activGroup = ref('Default');
const fieldGroups = reactive<Array<fieldGroup>>([]);
loadFieldGroups().then(v => {
  fieldGroups.push(...v);
  activGroup.value = fieldGroups[0].ElementValue;
});

defineExpose({
  Save: async () => {
    const k = await formRef.value?.validate();
    return formData.value;
  },
});
</script>
