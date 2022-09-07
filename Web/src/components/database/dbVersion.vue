<template>
  <div class="dbVersion">
    <span class="versionTitle" v-text="dbVersion.dbVersion" />
    <span class="versionDesc" v-text="dbVersion.dbVersionDesc" />
  </div>
</template>
<script lang="ts" setup>
// const props = defineProps({});

// const emits = defineEmits([]);=
import { getDatabaseVersion } from '@/serverApi/databaseAPIs';

const dbVersion = reactive<{
  dbVersion: string;
  dbVersionDesc: string;
}>({
  dbVersion: ``,
  dbVersionDesc: ``,
});
(async () => {
  const { Data } = await getDatabaseVersion();
  if (Data) {
    dbVersion.dbVersion = Data.Version;
    dbVersion.dbVersionDesc = Data.VersionDesc;
  }
})();
</script>
<style scoped lang="less">
.dbVersion {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 150px;
  top: 15px;
  .versionTitle {
    font-size: 12px;
  }
  .versionDesc {
    font-size: 12px;
  }
}
</style>
