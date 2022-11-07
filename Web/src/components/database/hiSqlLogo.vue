<template>
  <router-link :to="{ path: '/' }" class="flex items-center">
    <div class="hiLogo">
      <img class="mr-10px h-30px" src="@/assets/hi_logo.png" />
      <span class="logoText">HiSql Gui</span>
    </div>
  </router-link>
</template>
<script lang="ts" setup>
// const props = defineProps({});
// const emits = defineEmits([]);
// write some code
</script>
<style scoped lang="less">
.hiLogo {
  position: relative;
  display: flex;
  .logoText {
    font-size: 18px;
    color: black;
  }
}
</style>
