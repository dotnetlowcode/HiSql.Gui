<template>
  <a-config-provider :locale="zhCN">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import dayjs from 'dayjs';

const cacheRouter = ref(['Table', 'TableView']);
dayjs.locale('zh-cn');
</script>

<style lang="less">
#app {
  height: 100%;
}
html {
  overflow: hidden;
}
.ant-pro-page-container-children-content {
  margin-top: 0;
}
.login-left {
  .ant-checkbox + span {
    color: #888888;
  }
}
</style>
