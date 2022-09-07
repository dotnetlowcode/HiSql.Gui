<template>
  <template v-if="isOpen">
    <div v-show="taskList.length > 0" id="taskPanel" class="taskPanel">
      <div class="btnClose" @click="toggleIsOpen(false)">x</div>
      <div class="taskUl">
        <div v-for="taskObj in taskList" :key="taskObj.TaskId">
          <label v-text="taskObj.TalbeName"></label>
          <span v-if="taskObj.Status === 0">导出表任务等待中</span>
          <span v-else-if="taskObj.Status === 1" v-text="taskObj.Message || `进行中`"></span>
          <span v-else-if="taskObj.Status === 200">
            导出表任务完成,
            <a target="_blank" class="dowloadLink" :href="getDowloadUrl(taskObj)">点击下载</a>
          </span>
          <span v-else-if="taskObj.Status === 500">导出表任务失败,请重试!</span>
          <span v-else>未知状态</span>
        </div>
      </div>
    </div>
  </template>
  <div v-else-if="taskList.length > 0" class="dowloadBigBtn" @click="toggleIsOpen(true)">
    <hi-icon :icon-name="`icon-icon_xiazai`"></hi-icon>
  </div>
</template>
<script lang="ts" setup>
import { useStore } from 'vuex';
import { StoreType } from '@/store';
import webConfig from '@/serverApi/config';
import { ExportTaskAddEvent, ExportTaskInfoModel } from '@/store/model/exportTaskInfo';
import hiIcon from '../Icon/hiIcon.vue';
import bus from '@/utils';

// const props = defineProps({
//   tableName: {
//     type: String,
//     required: true,
//   },
// });
const store = useStore<StoreType>();
const taskList = computed(() => {
  return store.state.ExportTask;
  // const filterResult = store.state.ExportTask.filter(r => r.TalbeName === props.tableName);
  // return filterResult.length > 0 ? filterResult[0] : null;
});
const isOpen = ref(false);
const getDowloadUrl = (item: ExportTaskInfoModel) => {
  const obj = JSON.parse(item.Result);
  return webConfig.ApiConfig.ApiHost + obj.FilePath;
};
const toggleIsOpen = (value?: boolean) => {
  if (value !== undefined) {
    isOpen.value = value;
  } else {
    isOpen.value = !isOpen.value;
  }
  if (!isOpen.value) {
    store.dispatch('clearOverTask');
  }
};

(() => {
  (window as any).bus = bus;
  function addExportTaskEvent() {
    isOpen.value = true;
  }
  bus.on(ExportTaskAddEvent, addExportTaskEvent);
  onUnmounted(() => {
    bus.off(ExportTaskAddEvent, addExportTaskEvent);
  });
})();
</script>
<style lang="less" scoped>
@bottomValue: 10px;
.taskPanel {
  position: absolute;
  width: 300px;
  background-color: @primary-color;
  z-index: 10;
  border: solid 1px #ccc;
  right: 15px;
  bottom: @bottomValue;
  border-radius: 5px;
  color: white;
  .taskUl {
    padding: 5px;
    margin-bottom: 0;
    height: 100%;
    max-height: 80px;
    overflow-y: auto;
  }
  .dowloadLink {
    color: white;
    text-decoration: underline;
  }
  .btnClose {
    width: 18px;
    height: 18px;
    line-height: 16px;
    text-align: center;
    position: absolute;
    right: -8px;
    top: -9px;
    border-radius: 15px;
    background-color: #be5812;
    cursor: pointer;
  }
}
.dowloadBigBtn {
  width: 40px;
  height: 40px;
  position: absolute;
  right: 15px;
  bottom: @bottomValue;
  background: white;
  color: @primary-color;
  font-size: 36px;
  line-height: 40px;
  border: solid 1px #ccc;
  border-radius: 20px;
  text-align: center;
  z-index: 100;
  cursor: pointer;
}
</style>
