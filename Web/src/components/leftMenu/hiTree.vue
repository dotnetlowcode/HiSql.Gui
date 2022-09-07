<template>
  <RecycleScroller
    v-if="data.length > 10"
    v-slot="{ item }"
    class="scroller"
    :items="data"
    :item-size="21"
    key-field="id"
  >
    <div><span v-text="item.title"></span></div>
    <template v-if="item.children.length > 0">
      <HiTree :data="item.children" :virtual="virtual"></HiTree>
    </template>
  </RecycleScroller>
  <ul v-else class="hiTree">
    <li v-for="nodeObj in data" :key="nodeObj.id" :style="{ height: `200px` }">
      <div><span v-text="nodeObj.title"></span></div>
      <template v-if="nodeObj.children.length > 0">
        <HiTree :data="nodeObj.children" :virtual="virtual"></HiTree>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
export type treeDataItem = {
  title: string;
  id: string;
  children: Array<treeDataItem>;
  childrenLoadFun?: () => Promise<Array<treeDataItem>>;
};
const props = defineProps({
  data: {
    type: Array as () => Array<treeDataItem>,
    required: true,
  },
  virtual: {
    type: Boolean,
  },
});

props.data.forEach(nodeObj => {
  if (nodeObj.childrenLoadFun) {
    nodeObj.childrenLoadFun();
  }
});
</script>

<style scoped lang="less">
.hiTree {
  padding-left: 10px;
  height: 500px;
}
.scroller {
  height: 100%;
  overflow: auto;
}
</style>
