<template>
  <a-table
    size="small"
    style="width: 100%; height: 100%"
    :columns="columns"
    :data-source="data"
    :scroll="{
      x: 'max-content',
      y: 'max-content',
    }"
  ></a-table>
</template>
<script setup lang="ts">
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  headers: {
    type: Array as () => Array<{
      FieldDesc: string;
      FieldName: string;
    }>,
    required: true,
  },
});
const columns: Array<any> = [];
props.headers.forEach(headeField => {
  columns.push({
    title: headeField.FieldDesc,
    dataIndex: headeField.FieldName,
    width: 150,
  });
});
</script>
