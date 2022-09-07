<template>
  <div>
    <columns-render size="small" :param="columnObj" @column-update="updateValue" />
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import columnsRender from '../columnsRender/columnsRender.vue';
import { ColumnsRenderParam } from '../columnsRender/columnsRenderViewModel';
import { Dictionary } from '@/helper/arrayHelper';

const props = defineProps({
  value: {
    type: Object as PropType<string | boolean>,
    required: true,
  },
  fieldType: {
    type: ColumnStruct,
    required: true,
  },
});
const emit = defineEmits([`update:value`]);
const dataObj: Dictionary<string, any> = {};
// eslint-disable-next-line vue/no-setup-props-destructure
dataObj[`${props.fieldType.FieldName}`] = props.value;
const columnObj = new ColumnsRenderParam(dataObj, props.fieldType, [props.fieldType], false);
const updateValue = (p: any) => {
  // dataObj[p.fieldName] = p.value;
  emit('update:value', p.value);
};
</script>
