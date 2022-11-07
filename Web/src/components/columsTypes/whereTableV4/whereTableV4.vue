<template>
  <div class="h-full overflow-hidden flex flex-row w-full mb-10px">
    <div class="dmsItem">
      <span class="dmsTitle">筛选条件</span>
      <span class="dmsIcon" @click="openFilter">
        <hi-icon icon-name="icon-jiahao" />
      </span>
    </div>
    <div class="flex-1 overflow-hidden">
      <div
        v-for="item in viewModel.selectedDataList"
        :key="item.FieldName + item.Unit"
        class="float-left bg-[#e6f5ef] h-30px leading-30px text-center mt-10px px-30px box-border mr-10px text-size-[#000000] pr-40px cursor-pointer relative selectedDataList"
      >
        <a-popover placement="bottom" trigger="click">
          <span>
            {{ item.FieldDesc }}
            <template v-if="item.FieldBigType === 'Date'">- {{ item.Unit }}</template>
          </span>
          :
          <span>
            {{
              fmtValueShow(item.Operate[item.OperateIndex].SqlValue, item.FieldBigType, item.Unit)
            }}
          </span>
          <span
            class="absolute right-0px top-0 z-10 h-30px w-30px closeIcon"
            @click.stop="deleteItem(item)"
          >
            <close-circle-two-tone two-tone-color="#f00" />
          </span>
          <template #content>
            <columnsRender
              style="width: 100%"
              :param="item.fieldStruct"
              :is-multi-value="true"
              :prop-picker="item.Picker"
              :show-time="item.ShowTime"
              @column-update="v => updateValue(item, v)"
            />
          </template>
        </a-popover>
      </div>
    </div>
    <a-modal
      v-model:visible="isShowFilter"
      :mask-closable="false"
      :keyboard="false"
      width="80%"
      title="添加筛选字段"
      @ok="handleOk"
    >
      <div>
        <div
          v-for="(item, key) in viewModel.showGroupColumn"
          :key="key"
          class="overflow-hidden m-10px"
        >
          <div class="float-left w-100px">{{ key }}</div>
          <div class="float-left w-[calc(100%-100px)] border-bottom-[#eeeeee] border-b-[1px]">
            <div
              v-for="(child, childIndex) in item"
              :key="childIndex"
              class="float-left w-[calc(25%-20px)] mx-10px mb-10px"
            >
              <a-checkbox
                v-model:checked="child.Select"
                @change="viewModel.updateShowColumn(child)"
              >
                {{ child.FieldDesc }}
                <template v-if="child.FieldBigType === 'Date'">- {{ child.Unit }}</template>
              </a-checkbox>
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { CloseCircleTwoTone } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { DataSearchViewModel, ShowColumnType, WhereTableV4 } from './dataSearchViewModel';
import { ColumnStruct } from '../../../serverApi/models/columnStruct';

dayjs.extend(weekOfYear);
const isShowFilter = ref(false);
const emit = defineEmits([`search`]);
const props = defineProps({
  tableColumnsStruct: {
    validator(value) {
      return Array.isArray(value) && value.length > 0;
    },
    type: Array as () => Array<ColumnStruct>,
    required: true,
  },
});
const viewModel = reactive(new DataSearchViewModel(props.tableColumnsStruct));
watch(
  () => props.tableColumnsStruct,
  () => {
    viewModel.setColumns(props.tableColumnsStruct);
  },
);
// 打开筛选字段
const openFilter = () => {
  viewModel.fieldParse();
  isShowFilter.value = true;
};

const handleOk = () => {
  viewModel.createdSelectedDataList();
  isShowFilter.value = false;
};

// 删除
const deleteItem = (item: ShowColumnType) => {
  viewModel.deleteItem(item);
};

const updateValue = (formData: any, p: { fieldName: string; value: any }) => {
  formData.Operate[formData.OperateIndex].SqlValue = p.value;
  viewModel.updateShowColumn(formData);
};

const fmtValueShow = (value: string, handleType: string, dateUnit: string) => {
  if (!value) {
    return '';
  }
  if (handleType === 'String') {
    return value;
  }
  if (handleType === 'Date') {
    let fmtDate = '';
    const lst = value.split(',');

    lst.forEach(ele => {
      switch (dateUnit) {
        case '月':
          fmtDate += `~${dayjs(ele).format('YYYY-MM')}`;
          break;
        case '周':
          debugger;
          // eslint-disable-next-line no-useless-concat
          fmtDate += `~${dayjs(ele).year()}第${dayjs(ele).week()}周`;
          debugger;
          break;
        case '日':
          fmtDate += `~${dayjs(ele).format('YYYY-MM-DD')}`;
          break;
        case '秒':
          fmtDate += `~${dayjs(ele).format('YYYY-MM-DD HH:mm:ss')}`;
          break;
        default:
          break;
      }
    });

    console.log(`格式化时间：${fmtDate.slice(1)}`);
    return fmtDate.slice(1);
  }
  return value.replace(',', '~');
};

defineExpose<WhereTableV4>({
  getFilterWhere: () => {
    const { whereSql, whereParam } = viewModel.queryBuild();
    return {
      Sql: whereSql,
      SqlParam: whereParam,
    };
  },
});
</script>

<style lang="less" scoped>
@borderColor: #e5e7eb;
@borderstyle: solid 2px @borderColor;
@valueBgColor: #e6f5ef;
@dmsBgColor: #ecf0fb;
.ant-drawer-body {
  height: calc(100% - 55px);
  overflow: auto;
  .ant-table-content,
  .ant-table,
  .ant-table-scroll,
  .ant-spin-container,
  .ant-spin-nested-loading,
  .ant-table-wrapper {
    height: 100%;
  }

  .ant-table-body {
    max-height: calc(100% - 45px);
  }
  .valueSpan {
    margin-right: 20px;
  }
  .preWhereStr {
    border-radius: 5px;
    border: solid 1px #ccc;
    padding: 10px;
    background-color: #f5f5f5;
    margin-top: 5px;
    min-height: 30px;
  }
  .operateBtns {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }
  .settingBtn {
    margin-right: 10px;
  }
}

.dmsItem {
  height: 50px;
  line-height: 50px;
  // border-bottom: solid 1px @borderColor;
  font-size: 14px;
  color: #191919;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.dmsTitle {
  width: 56px;
  text-align: right;
}

.dmsIcon {
  font-size: 16px;
  padding-left: 12px;
  padding-right: 24px;
  position: relative;
  top: 1px;
  width: 52px;
}

.closeIcon {
  display: none;
  cursor: pointer;
}
.selectedDataList:hover .closeIcon {
  display: block;
}
</style>
