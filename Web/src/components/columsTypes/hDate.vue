<template>
  <a-range-picker v-if="isMultiValue" :show-time="showTime" @change="onChange" />
  <a-date-picker
    v-else
    v-model:value="dateValue"
    :size="size"
    :picker="`date`"
    :show-time="showTime"
    placeholder="请输入..."
    @change="changeValue"
  />
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';
import { PropType } from 'vue';

const dateValue = ref<string | Dayjs>('');
const emit = defineEmits([`change`]);
const changeValue = () => {
  emit(`change`, dateValue.value);
};
const onChange = (value: Array<dayjs.Dayjs>) => {
  if (value === null) {
    emit(`change`, ``);
    return;
  }
  const beginDate = value[0].format();
  const endDate = value[1].format();
  emit(`change`, `${beginDate},${endDate}`);
};
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String as PropType<'middle' | 'small' | 'large' | undefined>,
    required: false,
    default: 'middle',
  },
  showTime: {
    type: Boolean,
    default: false,
  },
  /**
   * 日期是范围还是单个值,默认值`true`范围值
   */
  isMultiValue: {
    type: Boolean,
    default: true,
  },
});
dateValue.value = props.value ? dayjs(props.value) : '';
</script>
