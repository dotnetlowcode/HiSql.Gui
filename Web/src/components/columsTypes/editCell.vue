<template>
  <div class="mainPage">
    <template v-if="isEdit">
      <slot name="editRender">
        <a-input
          v-model:value="vValue"
          class="w-full"
          @blur="
            () => {
              isEdit = false;
            }
          "
        ></a-input>
      </slot>
    </template>
    <template v-else>
      <slot>
        <div
          @dblclick="
            () => {
              isEdit = true;
            }
          "
        >
          <span v-text="value"></span>
        </div>
      </slot>
    </template>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});
const isEdit = ref(false);
const emits = defineEmits([`update:value`]);
const vValue = computed({
  get: () => {
    return props.value;
  },
  set: v => {
    emits('update:value', v);
  },
});

// write some code
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
}
</style>
