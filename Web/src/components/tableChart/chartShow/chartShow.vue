<template>
  <div class="chartShow" :class="{ hideHeader: isFullShow }">
    <div class="chartHeader">
      <span class="chartTitle" v-text="viewModel.charInfo.Title"></span>
      <div class="chartOperateItems">
        <span title="刷新" class="operateItem" @click="refresh">
          <hi-icon :icon-name="`icon-a-HiSqlGUIICON_shuaxin`" />
        </span>
        <span v-if="!isShared" title="编辑" class="operateItem" @click="editObj">
          <hi-icon :icon-name="`icon-a-HiSqlGUIICON_bianji`" />
        </span>
        <span v-if="!isShared" title="筛选" class="operateItem" @click="filterObj">
          <hi-icon :icon-name="`icon-shaixuan-05`" />
        </span>
        <template v-if="!isFullShow">
          <span v-if="!isShared" title="删除" class="operateItem !text-18px" @click="delObj">
            <hi-icon :icon-name="`icon-shanchu`" />
          </span>
          <span title="全屏" class="operateItem !text-18px" @click="fullShow">
            <hi-icon :icon-name="`icon-quanping`" />
          </span>
        </template>
      </div>
    </div>
    <div ref="chartMainDom" class="chartMain"></div>
    <a-drawer
      v-model:visible="viewModel.ShowSearchFrom"
      width="600"
      title="搜索"
      placement="right"
      :closable="true"
    >
      <template #extra>
        <a-button
          type="primary"
          @click="
            () => {
              viewModel.SearchFromObj?.Submit();
            }
          "
        >
          <CheckOutlined />
          搜索
        </a-button>
      </template>
      <searchFrom
        :ref="
      (el: any) => {
        viewModel.SearchFromObj = el;
      }"
        :search-columns-struct="searchFields"
        @search="searchData"
      />
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
import ExclamationCircleOutlined from '@ant-design/icons-vue/lib/icons/ExclamationCircleOutlined';
import { Modal } from 'ant-design-vue';
import { createVNode } from 'vue';
import { CheckOutlined } from '@ant-design/icons-vue';
import { Dictionary } from '@/helper/arrayHelper';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { ChartShowViewModel, ChartShowVue } from './chartShowViewModel';
import { getSearchColumns, searchParamToWhereJson } from '@/serverApi/dataHelper';

const props = defineProps({
  chartId: {
    type: String,
    required: true,
  },
  isFullShow: {
    type: Boolean,
    required: false,
    default: false,
  },
  isShared: {
    type: Boolean,
    required: false,
    default: false,
  },
});
const chartMainDom = ref<HTMLElement | undefined>();
const viewModel = reactive(new ChartShowViewModel());
const loadView = (searchParam: Dictionary<string, any> = {}) => {
  viewModel.Init(props.chartId).then(() => {
    // eslint-disable-next-line no-undef
    nextTick(() => {
      setTimeout(() => {
        if (chartMainDom.value) {
          viewModel.Excute(chartMainDom.value, searchParam, viewModel.filedMap);
        }
      }, 10);
    });
  });
};
loadView();
const refresh = () => {
  if (chartMainDom.value) {
    viewModel.Excute(chartMainDom.value, {}, viewModel.filedMap);
  }
};
const emit = defineEmits([`edit`, `delete`, `fullShow`]);
const editObj = async () => {
  emit(`edit`);
};
const delObj = async () => {
  Modal.confirm({
    title: '确认要删除吗?',
    icon: createVNode(ExclamationCircleOutlined),
    async onOk() {
      await viewModel.Delete();
      emit('delete');
    },
  });
};
const fullShow = async () => {
  emit(`fullShow`, viewModel.charInfo);
};
const tableFields = inject<Array<ColumnStruct>>('TableFields') ?? [];
const searchFields = computed(() => {
  return getSearchColumns(tableFields);
});
const filterObj = () => {
  viewModel.ShowSearchFrom = true;
};
const searchData = async (searchParam: object) => {
  viewModel.ShowSearchFrom = false;
  const searchWhere = searchParamToWhereJson(tableFields, searchParam);
  loadView(searchWhere);
};
defineExpose<ChartShowVue>({
  reload: (searchParam?: Dictionary<string, any>) => {
    loadView(searchParam);
  },
  resize: () => {
    viewModel.Resize();
  },
});
</script>

<style lang="less" scoped>
.chartShow {
  height: 100%;
  position: relative;
  @headerHeight: 60px;

  .chartHeader {
    height: @headerHeight;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22px;

    .chartTitle {
      font-size: 14px;
      font-weight: 700;
      text-align: left;
      color: #191919;
    }

    .chartOperateItems {
      display: flex;
      visibility: hidden;
    }

    .operateItem {
      font-size: 15px;
      cursor: pointer !important;
      width: 30px;
      text-align: center;
      display: flex;
      margin-left: 10px;
      justify-content: center;
      align-items: center;
    }
  }

  .chartMain {
    width: 100%;
    height: calc(100% - @headerHeight);
    padding: 0 20px 0 20px;
    overflow: hidden;
  }
}

.chartShow:hover {
  .chartOperateItems {
    visibility: visible;
  }
}

.hideHeader {
  .chartHeader {
    display: none;
  }

  .chartMain {
    height: 100%;
  }
}

// ::v-deep(.ant-spin-nested-loading) {
//   height: 100%;
//   overflow: auto;
// }
</style>
