<template>
  <div class="digitalCard">
    <span class="dTitle" v-text="dTitle"></span>
    <span class="dValue" v-text="dValue"></span>
  </div>
</template>
<script lang="ts" setup>
defineProps({
  dTitle: {
    type: String,
    required: true,
    default: '',
  },
  dValue: {
    type: String,
    required: true,
    default: '',
  },
});
// const emits = defineEmits([]);
// write some code
</script>
<style scoped lang="less">
.digitalCard {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100px;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.dTitle,
.dValue {
  position: relative;
  font-size: 18px;
}
</style>
