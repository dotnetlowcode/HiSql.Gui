<template>
  <div class="er-editor-view-container">
    <div ref="graphContainer" class="w-full h-full" />
    <div ref="minimapContainer" class="minimap-container" />
    <graph-toolbar
      @zoom-in="onHandleToolbar('in')"
      @zoom-out="onHandleToolbar('out')"
      @fit-content="onHandleToolbar('fit')"
      @real-content="onHandleToolbar('real')"
    />
  </div>
</template>
<script lang="ts" setup>
import './index.less';
import { GraphData } from '../xflow/index';
import GraphToolbar from './Toolbar/index';
import { ERGraphViewModel } from './ERGraphViewModel';

const props = defineProps<{
  data: GraphData;
}>();
const emits = defineEmits([`viewJsonChange`, `removeTable`]);
const graphContainer = ref<HTMLDivElement>();
const minimapContainer = ref<HTMLDivElement>();
const viewModel = new ERGraphViewModel();

// eslint-disable-next-line no-undef
nextTick(() => {
  if (minimapContainer.value && graphContainer.value) {
    viewModel.init(graphContainer.value, minimapContainer.value);
    if (viewModel.baseGraph?.cellController) {
      viewModel.baseGraph.cellController.removeTable = (tableName: string) => {
        emits(`removeTable`, tableName);
      };
    }
    // viewModel.baseGraph?.registerEvent([
    //   {
    //     eventName: `node:click`,
    //     handler: (e: any) => {
    //       debugger;
    //       const viewJson = viewModel.save();
    //       emits(`viewJsonChange`, viewJson);
    //     },
    //   },
    // ]);
  }
});

const onHandleToolbar = (action: 'in' | 'out' | 'fit' | 'real') => {
  viewModel.onHandleToolbar(action);
};
watch(props.data, () => {
  viewModel.baseGraph?.updateGraph(props.data);
});
defineExpose({
  save: () => {
    const viewJson = viewModel.save();
    emits(`viewJsonChange`, viewJson);
    return viewJson;
  },
});
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
}
</style>
