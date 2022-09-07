<template>
  <div :class="`entity-container  ${getCls()}`">
    <div :class="`content ${getCls()}`">
      <div class="head">
        <div>
          <BarsOutlined class="type" />
          <span
            v-text="
              `${tableInfo.Name}${tableInfo.Description.length > 0 ? '-' : ''}${
                tableInfo.Description
              }`
            "
          ></span>
        </div>
        <a-button class="delBtn" type="link" @click="deleteTable">
          <hi-icon icon-name="icon-shanchu" />
        </a-button>
      </div>
      <div class="body">
        <div v-for="property in tableInfo.Columns" :key="property.FieldName" class="body-item">
          <div class="name" :title="`${property.FieldName}-${property.FieldDesc}`">
            <a-checkbox v-model:checked="property.IsSelect">
              <span v-if="property.IsPrimary" class="pk">PK</span>
              {{ `${property.FieldName}-${property.FieldDesc}` }}
            </a-checkbox>
            <span v-if="false" class="fk">FK</span>
          </div>

          <div class="type" v-text="property.FieldType"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import './Entity.less';
import { BarsOutlined, EllipsisOutlined } from '@ant-design/icons-vue';
import { GraphTableData } from '../xflow/interface/graph-core';
import hiIcon from '../../../Icon/hiIcon.vue';

const props = defineProps<{
  tableInfo: GraphTableData;
}>();
const emits = defineEmits([`DeleteTable`]);
const getCls = () => {
  // if (entity.entityType === EntityType.FACT) {
  //   return 'fact';
  // }
  // if (entity.entityType === EntityType.DIM) {
  //   return 'dim';
  // }
  return 'other';
};

const deleteTable = () => {
  emits(`DeleteTable`, props.tableInfo.Name);
};
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
  .delBtn {
    font-size: 16px;
    color: #494a32;
  }
}
</style>
