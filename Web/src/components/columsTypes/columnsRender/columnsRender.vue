<template>
  <component
    :is="randType"
    :value="inputValue"
    :column-struct="columnStruct"
    :table-columns-struct="tableColumnsStruct"
    :from-data="formData"
    :is-multi-value="isMultiValue"
    :show-time="showTime"
    @change="changeValue"
  />
</template>

<script setup lang="ts">
import { Ref } from 'vue';
import { HRenderType, TableColumn } from '../fromEdit/fromEditViewModel';
import { ColumnsRenderParam } from './columnsRenderViewModel';
import hNumber from '../intger.vue';
import hText from '../text.vue';
import hBool from '../hBool.vue';
import hDate from '../hDate.vue';
import hRefTable from '../hRefTable/hRefTable.vue';
import whereTable from '../whereTable/whereTable.vue';
import hDropDown from '../hDropDown/hDropDown.vue';
import hTextCheck from '../textCheck.vue';

const componentsMap: Map<HRenderType, any> = new Map();
componentsMap.set(`hBool`, hBool);
componentsMap.set('hText', hText);
componentsMap.set('hNumber', hNumber);
componentsMap.set('hDate', hDate);
componentsMap.set('hRefTable', hRefTable);
componentsMap.set('whereTable', whereTable);
componentsMap.set(`hDropDown`, hDropDown);
componentsMap.set(`hTextCheck`, hTextCheck);

const props = defineProps({
  param: {
    required: true,
    type: ColumnsRenderParam,
  },
});
// eslint-disable-next-line vue/no-setup-props-destructure

const columnStruct = ref(props.param.columnStruct);
const formData: Ref<any> = ref(props.param.formData);
const tableColumnsStruct = ref(props.param.TableColumnsStruct);
const isMultiValue = ref(props.param.multiValue);
const showTime = ref(false);
if (props.param.columnStruct.DateAccurate === 'Time') {
  showTime.value = true;
}
let tableColumn = new TableColumn(columnStruct.value);
const randType = ref();
const inputValue = ref(formData.value[columnStruct.value.FieldName]);
const initFun = () => {
  tableColumn = new TableColumn(props.param.columnStruct);
  randType.value = componentsMap.get(tableColumn.RenderType);
};
initFun();
watch(props.param, v1 => {
  formData.value = v1.formData;
  tableColumnsStruct.value = v1.TableColumnsStruct;
  columnStruct.value = v1.columnStruct;
  initFun();
});
randType.value = componentsMap.get(tableColumn.RenderType);
const emit = defineEmits(['columnUpdate']);
// props.formData.
const changeValue = (currentValue: any) => {
  console.log(`保存!`);
  console.log(formData);
  emit('columnUpdate', {
    fieldName: columnStruct.value.FieldName,
    value: currentValue,
  });
  // props.tabColumnData[props.columnStruct.FieldName] = inputValue.value;
};
</script>
