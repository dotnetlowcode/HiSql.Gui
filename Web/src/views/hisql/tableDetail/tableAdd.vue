<template>
  <TableStruct :table-name="``" :is-view-api="false" @createNewTable="createTable"></TableStruct>
</template>
<script setup lang="ts">
import { tableDetailRouterName } from '@/router';

// eslint-disable-next-line no-undef
const router = useRouter();
const createTable = (tableName: string) => {
  router.push({
    name: tableDetailRouterName,
    params: {
      tableName,
    },
  });
};
</script>

<style lang="less" scoped></style>
