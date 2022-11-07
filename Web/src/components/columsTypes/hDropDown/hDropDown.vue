<template>
  <a-select
    v-model:value="defaultValue"
    :size="size"
    :mode="isMultiValue ? `multiple` : undefined"
    placeholder="请选择..."
    class="w-full"
    @change="changeValue"
  >
    <a-select-option
      v-for="optionItem in selectOptions"
      :key="optionItem.Value"
      :value="optionItem.Value"
    >
      {{ optionItem.Title }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { List } from 'linqts';
import { PropType } from 'vue';
import { ColumnStruct, valueSplitText } from '../../../serverApi/models/columnStruct';
import { DropdownOptions, HDropDownViewModel } from './hDropDownViewModel';

const columnValue = ref<string>(``);
const emit = defineEmits([`change`, `update:value`]);
const changeValue = (selectValue: any, option: any) => {
  if (typeof selectValue === 'object') {
    columnValue.value = selectValue.join(valueSplitText);
  } else {
    columnValue.value = `${selectValue}`;
  }
  emit(`change`, columnValue.value);
  emit(`update:value`, columnValue.value);
};

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String as PropType<'small' | 'middle' | 'large' | undefined>,
    required: false,
    default: 'middle',
  },
  columnStruct: {
    type: ColumnStruct,
    required: true,
  },
  /**
   * 单选表格还是多选,默认值`true`单选
   */
  isMultiValue: {
    type: Boolean,
    default: false,
  },
});

columnValue.value = props.value ?? ``;
watch([props.value], () => {
  columnValue.value = props.value ?? ``;
});
const viewModel = new HDropDownViewModel();
const selectOptions: DropdownOptions = reactive([]);

const defaultValue = ref();
viewModel.loadData(props.columnStruct).then((datas: Array<{ [key: string]: any }>) => {
  let values: List<string> = new List();
  // try {
  values = new List(`${columnValue.value}`.split(valueSplitText));
  // } catch (error) {
  //
  // }
  datas.forEach(dataItem => {
    const optionValue = `${dataItem[`${props.columnStruct.RefField}`]}`; // 值都转成String
    const isSelected = values.Contains(optionValue);
    // const optionItem = {
    //   Title: dataItem.ElementDesc,
    //   Value: dataItem.ElementValue,
    //   Select: isSelected,
    // };
    // if (dataItem.ElementValue && dataItem.ElementDesc) {
    //   // 如果检测到是枚举表
    //   selectOptions.push(optionItem);
    //   return;
    // }
    let optionText = ``;
    Object.keys(dataItem).forEach(itemKey => {
      optionText += `-${dataItem[itemKey]}`;
    });
    if (optionText.length > 0) {
      optionText = optionText.substring(1);
    }
    selectOptions.push({
      Title: optionText,
      Value: optionValue,
      Select: isSelected,
    });
  });

  if (props.isMultiValue) {
    defaultValue.value = new List(selectOptions)
      .Where(r => r?.Select ?? false)
      .Select(r => r.Value)
      .ToArray();
  } else {
    defaultValue.value = new List(selectOptions).SingleOrDefault(r => r?.Select ?? false)?.Value;
  }
});
</script>
