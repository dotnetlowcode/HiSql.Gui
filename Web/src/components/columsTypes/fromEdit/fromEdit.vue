<template>
  <a-form
    :ref="
      (el:any) => {
        viewModel.formRef=el;
      }
    "
    :rules="viewModel.rules"
    :model="viewModel.formData"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <div v-if="props.fieldGroupName">
      <a-tabs v-model:activeKey="viewModel.activGroup">
        <a-tab-pane
          v-for="fGroup in viewModel.fieldGroups"
          :key="fGroup.ElementValue"
          :tab="`${fGroup.ElementDesc}配置`"
          force-render
        />
      </a-tabs>
    </div>
    <template v-for="fieldObj in viewModel.fromFields" :key="fieldObj.columnStruct.FieldName">
      <a-form-item
        v-if="viewModel.showColumn(fieldObj.columnStruct, isAddTable)"
        :ref="`${fieldObj.columnStruct.FieldName}`"
        :name="`${fieldObj.columnStruct.FieldName}`"
        :label="fieldObj.columnStruct.FieldDesc"
      >
        <columnsRender
          :param="fieldObj"
          @column-update="(pValue:any)=>{
          viewModel.updateValue(pValue);
        }"
        />
      </a-form-item>
    </template>
  </a-form>
</template>
<script lang="ts" setup>
import columnsRender from '../columnsRender/columnsRender.vue';
import { FromEditViewModel } from './fromEditViewModel';
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
  fieldGroupName: {
    required: false,
    type: String,
    default: `FieldGroup`,
  },
});
// watch(
//   () => props.fieldGroupName,
//   () => {
//
//     console.log(props.fieldGroupName);
//   },
// );
const viewModel = reactive(new FromEditViewModel());
(window as any).TEST = viewModel;
// activGroup为 ``时表示不需要分组
viewModel.activGroup = props.fieldGroupName ? 'Default' : ``;
viewModel.formData = Object.assign(viewModel.formData, props.tabColumnData);
viewModel.load(props.tabColumns, props.fieldGroupName);

const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };
defineExpose({
  Save: async () => {
    const k = await viewModel.formRef?.validate();
    return viewModel.formData;
  },
});
</script>
