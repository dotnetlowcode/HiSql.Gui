<template>
  <a-form ref="formRef" :model="formData" :label-col="labelCol" :wrapper-col="wrapperCol">
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
          <columnsRender :param="item" @column-update="updateValue" />
        </a-form-item>
      </RecycleScroller>
    </div>
  </a-form>
</template>
<script setup lang="ts">
import { Ref } from 'vue';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import { ColumnStruct, isMultiModel } from '../../../serverApi/models/columnStruct';
import { getSearchParamModel, SearchFromVue } from './searchFromViewModel';

const labelCol = { style: { width: '150px' } };
const wrapperCol = { span: 14 };
const formData: Ref<{
  [x: string]: any;
}> = ref({});
const formRef = ref();
// const rules: { [key: string]: Array<any> } = {};
const props = defineProps({
  /**
   * 搜索的列集合
   */
  searchColumnsStruct: {
    validator(value) {
      return Array.isArray(value) && value.length > 0;
    },
    type: Array as () => Array<ColumnStruct>,
    required: true,
  },
});
const fromFields = reactive<Array<ColumnsRenderParam>>([]);
const { searchParamModel, newSearchColumns } = getSearchParamModel(props.searchColumnsStruct);
(() => {
  //
  formData.value = { ...searchParamModel };
  // 初始化表单验证规则,目前只加了非空验证,后续可以增加其他规则
  for (let index = 0; index < newSearchColumns.length; index++) {
    const fieldObj = newSearchColumns[index];
    let isMultiValue = false;
    if (isMultiModel(fieldObj.SrchMode)) {
      isMultiValue = true;
    }
    fromFields.push(new ColumnsRenderParam(formData, fieldObj, newSearchColumns, isMultiValue));
  }
})();

const updateValue = (p: any) => {
  formData.value[p.fieldName] = p.value;
  console.info(formData);
};
const emits = defineEmits([`search`]);
defineExpose<SearchFromVue>({
  Submit: () => {
    const paramResult = { ...formData.value };
    for (const key in paramResult) {
      if (paramResult[key] === '') {
        delete paramResult[key];
      }
    }
    emits(`search`, paramResult);
    return paramResult as any;
  },
});
console.log(props);
</script>
<style lang="less" scoped>
.ant-form {
  height: 100%;
}
.fromItems {
  position: relative;
}
.dynamicItemsWaper {
  height: calc(100% - 50px);
}
.scroller {
  height: 100%;
  overflow: auto;
}
</style>
