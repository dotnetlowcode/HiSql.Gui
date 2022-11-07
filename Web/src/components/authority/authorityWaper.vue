<template>
  <div class="relative">
    <slot v-if="viewModel.hasAuth"></slot>
    <div v-if="!hidePanel && !viewModel.hasAuth" class="noAuth">
      <span>暂无权限</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { AuthorityViewModel, userAuthList } from './authorityViewModel';

const props = defineProps({
  operateId: {
    type: String,
    required: true,
    default: ``,
  },
  resId: {
    type: String,
    required: true,
    default: ``,
  },
  hidePanel: {
    type: Boolean,
    default: false,
  },
});
const viewModel = reactive(new AuthorityViewModel());
viewModel.Init(props.resId, props.operateId);
watch([userAuthList, () => props.resId, () => props.operateId], () => {
  viewModel.Init(props.resId, props.operateId);
});
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
}
.noAuth {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgb(181 181 181 / 50%);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  color: #757575;
  cursor: not-allowed;
}
</style>
