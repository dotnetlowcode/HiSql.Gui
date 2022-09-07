<template>
  <div class="fieldMapBlock">
    <span class="block mb-10px">字段映射</span>
    <div>
      <div class="mb-5px">
        <a-button
          size="small"
          @click="
            () => {
              viewModel.AddNewFieldMap();
            }
          "
        >
          添加
          <hi-icon :icon-name="`icon-tianjia`" />
        </a-button>
      </div>
      <table class="tableBorder">
        <thead>
          <tr>
            <td>原始名</td>
            <td>映射名</td>
            <td class="delTd">操作</td>
          </tr>
        </thead>
        <tr v-for="mapObj in viewModel.FieldMap" :key="mapObj.Id">
          <td>
            <!-- <editCell v-model:value="mapObj.OldTitle" /> -->
            <a-input v-model:value="mapObj.OldTitle" class="w-full" />
          </td>
          <td>
            <a-input v-model:value="mapObj.MapTitle" class="w-full" />
            <!-- <editCell v-model:value="mapObj.MapTitle" /> -->
          </td>
          <td class="delTd">
            <a
              @click="
                () => {
                  viewModel.DeleteFieldMap(mapObj);
                }
              "
            >
              删除
            </a>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
// const emits = defineEmits([]);

import { Dictionary } from '@/helper/arrayHelper';
import { FieldMapType } from '@/serverApi/tableInfoAPIs';
import { fieldMapType, TableFieldMapViewModel, typeFieldMapVue } from './tableFieldMapViewModel';

const props = defineProps({
  resId: {
    type: String,
    required: true,
  },
  type: {
    type: String as () => FieldMapType,
    required: true,
  },
});

// write some code
const viewModel = reactive(new TableFieldMapViewModel(props.resId, props.type));
viewModel.load();
defineExpose<typeFieldMapVue>({
  Save: async () => {
    await viewModel.Save();
    return viewModel.FieldMap;
  },
  AddField: fieldName => {
    viewModel.AddNewFieldMap(fieldName);
  },
  GetFieldMap: () => {
    const tFieldMap: Dictionary<string, string> = {};
    viewModel.FieldMap.forEach(r => {
      tFieldMap[r.OldTitle] = r.MapTitle;
    });
    return tFieldMap;
  },
});
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
}

.fieldMapBlock {
  display: flex;
  padding: 10px;
  flex-direction: column;
}

.tableBorder td {
  padding: 5px 10px;
  min-width: 112px;
}

.tableBorder .delTd {
  min-width: 50px;
}
</style>
