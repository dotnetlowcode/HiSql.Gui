<template>
  <div class="wrapPanel">
    <!-- :title="`表名:${tableName}`" -->
    <a-card size="small" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="openIndexCreate">
          <PlusCircleOutlined />
          增加索引
        </a-button>
      </template>
      <div class="tableWraper">
        <table class="tableStruct">
          <thead>
            <td class="td0"></td>
            <td class="tdA">
              <span>索引名</span>
            </td>
            <td class="tdB">
              <span>索引类型</span>
            </td>
            <td class="tdC">操作</td>
          </thead>
          <tbody>
            <tr v-for="(colData, index) in indexsData" :key="index">
              <td class="td0"></td>
              <td class="tdA">
                <span v-text="colData.IndexName"></span>
              </td>
              <td class="tdB" @click.stop>
                <span v-text="colData.IndexType"></span>
              </td>
              <td class="tdC">
                <a-popconfirm
                  title="您确定要删除吗?"
                  ok-text="是"
                  cancel-text="否"
                  @confirm="deleteIndex(colData)"
                >
                  <a>删除</a>
                </a-popconfirm>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </a-card>
    <createIndex v-if="showIndexCreate" :table-name="props.tableName" @close="createOver" />
  </div>
</template>
<script setup lang="ts">
import message from 'ant-design-vue/es/message';
import { TabIndex } from '@/serverApi/request/table/tableIndexRequest';
import { deleteTableIndex, getTableIndex } from '@/serverApi/tableInfoAPIs';
import createIndex from './createIndex.vue';

const showIndexCreate = ref(false);

const props = defineProps({
  tableName: {
    type: String,
    required: true,
  },
});
const indexsData = reactive<Array<TabIndex>>([]);
const loadTableIndex = () => {
  getTableIndex(props.tableName).then(tableIndexs => {
    indexsData.length = 0;
    indexsData.push(...tableIndexs);
  });
};
loadTableIndex();
const deleteIndex = (record: TabIndex) => {
  deleteTableIndex(props.tableName, record.IndexName)
    .then(result => {
      if (result?.IsOk) {
        loadTableIndex();
        message.success(`已删除!`);
      } else {
        message.error(result?.Message ?? `删除失败!`);
      }
    })
    .catch(err => {
      message.error(`删除失败!${err}`);
    });
};
const openIndexCreate = () => {
  showIndexCreate.value = true;
  loadTableIndex();
};
const createOver = () => {
  showIndexCreate.value = false;
  loadTableIndex();
};
</script>
<style lang="less" scoped>
.wrapPanel {
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 212px);
  @tablebordercolor: #f0f0f0;

  .tableWraper {
    position: relative;
    width: 100%;
    height: 100%;
    border-top: solid 1px @tablebordercolor;
    .td0 {
      width: 30px;
    }
    .tdA {
      width: 350px;
    }
    .tdB {
      width: 100px;
    }
    .tdC {
      width: 60px;
      text-align: center;
      .editable-cell-icon:last-child {
        margin-right: 0;
      }
    }
  }
  .tableStruct {
    border: solid 1px @tablebordercolor;
    border-top: none;
    position: absolute;
    left: 0;
    top: 0;
    background-color: #fafafa;
    z-index: 10;
    td {
      padding: 5px 5px;
      border-right: solid 1px @tablebordercolor;
      border-bottom: solid 1px @tablebordercolor;
    }
  }
  .tableStructBody {
    padding-top: 33px;
    max-height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    // border-right: solid 1px @tablebordercolor;
    border-bottom: solid 1px @tablebordercolor;
    .editable-cell-icon {
      cursor: pointer;
      margin-right: 10px;
    }
    td {
      padding: 5px 5px;
      border-right: solid 1px @tablebordercolor;
      border-bottom: solid 1px @tablebordercolor;
      border-left: solid 1px @tablebordercolor;
    }
  }
  .tableStructBody tr:last-child td {
    border-bottom: none;
  }
}
.topPanel {
  color: red;
  position: relative;
  height: 100%;
}

.buttomPanel {
  position: fixed;
  width: 100%;
  bottom: 0;
  height: 300px;
}

.ant-card-extra {
  .ant-btn {
    margin-left: 20px;
  }
}
::v-deep(.ant-card-small > .ant-card-head) {
  border: none !important;
}
</style>
<style lang="less">
.ant-card {
  position: relative;
  height: 100%;

  .ant-card-body {
    position: absolute;
    width: 100%;
    height: calc(100% - 50px);
  }
  .ant-table-body {
    max-height: calc(100vh - 333px) !important;
  }
}
</style>
