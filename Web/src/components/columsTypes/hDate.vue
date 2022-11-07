<template>
  <a-range-picker
    v-if="isMultiValue"
    :show-time="showTime"
    :picker="propPicker"
    :locale="locale"
    @change="onChange"
  />
  <a-date-picker
    v-else
    v-model:value="dateValue"
    :size="size"
    :picker="propPicker"
    :show-time="showTime"
    :locale="locale"
    placeholder="请输入..."
    @change="changeValue"
  />
</template>

<script setup lang="ts">
import dayjs, { Dayjs } from 'dayjs';

import { PropType } from 'vue';
import 'dayjs/locale/zh-cn';

import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';

dayjs.locale('zh-cn');

const dateValue = ref<string | Dayjs | any>();

const emit = defineEmits([`change`]);

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

  /**
   * 日期维度  year-年  month-月   week-周  date-日   time-时间
   */
  propPicker: {
    // eslint-disable-next-line no-undef
    type: String as PropType<PickerMode | undefined>, // String as PropType<'year' | 'month' | 'week' | 'date' | 'second' | undefined>,
    default: 'date',
  },
});

const changeValue = () => {
  // eslint-disable-next-line no-use-before-define
  const dateValue2: any = dateValue.value.format();
  emit(`change`, dateValue2);
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
dateValue.value = props.value ? dayjs(props.value) : '';
</script>
