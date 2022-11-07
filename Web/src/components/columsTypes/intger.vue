<template>
  <template v-if="isMultiValue">
    <div class="flex">
      <a-input-number
        v-model:value="startValue"
        :size="size"
        placeholder="起始值"
        @change="multChangeValue"
      />
      <span class="spiltBlock">-</span>
      <a-input-number
        v-model:value="endValue"
        :size="size"
        placeholder="结束值"
        @change="multChangeValue"
      />
    </div>
  </template>
  <template v-else>
    <a-input-number
      v-model:value="textValue"
      :size="size"
      placeholder="请输入..."
      @change="changeValue"
    />
  </template>
</template>

<script setup lang="ts">
import { SizeType } from 'ant-design-vue/lib/config-provider/context';
import { PropType } from 'vue';

const startValue = ref(0);
const endValue = ref(0);
const textValue = ref<string>(``);
const emit = defineEmits([`change`]);
const changeValue = () => {
  emit(`change`, textValue.value);
};
const multChangeValue = () => {
  emit(`change`, `${startValue.value},${endValue.value}`);
};
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String as PropType<SizeType>,
    required: false,
    default: 'middle',
  },
  /**
   * 整数是范围还是单个值,默认值`true`范围值
   */
  isMultiValue: {
    type: Boolean,
    default: true,
  },
});
textValue.value = props.value ?? ``;
</script>
<style>
.spiltBlock {
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
