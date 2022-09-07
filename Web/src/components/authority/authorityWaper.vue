<template>
  <slot v-if="viewModel.hasAuth"></slot>
  <slot v-else name="accessDenied"></slot>
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
</style>
