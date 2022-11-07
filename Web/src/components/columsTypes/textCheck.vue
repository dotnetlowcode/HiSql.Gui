<template>
  <a-input v-model:value="valueKey" :size="size" placeholder="请输入..." @change="changeKey" />
  <template v-if="!!dataList.length">
    <div class="max-h-400px min-h-100px overflow-y-auto mt-20px">
      <div v-for="item in dataList" :key="item.FieldName" class="w-[calc(1/2-10px)] mb-15px">
        <a-checkbox v-model:checked="item.Select" @change="changeValue">
          {{ item.FieldDesc }}
        </a-checkbox>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="w-full h-full flex justify-center items-center mt-20px">
      <a-empty />
    </div>
  </template>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { queryTableField } from '@/serverApi/tableDataAPIs';
import { ColumnStruct } from '@/serverApi/models/columnStruct';

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String as PropType<'small' | 'middle' | 'large' | undefined>,
    required: false,
    default: 'default',
  },

  columnStruct: {
    type: ColumnStruct,
    required: true,
  },
});
const valueKey = ref(``);
const dataList = ref<
  Array<{
    FieldName: string;
    Select: boolean;
    FieldDesc: string;
  }>
>([]);
const emit = defineEmits([`change`]);
const changeValue = () => {
  let textValueStr = '';
  dataList.value.forEach(item => {
    if (item.Select) {
      textValueStr += `,${item.FieldName}`;
      textValueStr = textValueStr.slice(1);
    }
  });
  emit(`change`, textValueStr);
};

const getDataList = async () => {
  dataList.value = [];
  const list = await queryTableField(
    props.columnStruct.TabName,
    props.columnStruct.FieldName,
    valueKey.value,
  );
  dataList.value = list.map(r => {
    return {
      FieldName: r,
      Select: false,
      FieldDesc: r,
    };
  });
};
getDataList();
const changeKey = () => {
  getDataList();
};
</script>
