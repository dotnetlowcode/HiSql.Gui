/* eslint-disable prefer-const */ /* eslint-disable no-redeclare */
<template>
  <div class="flex h-full">
    <div class="w-20 h-full pb-50px box-border relative">
      <div
        v-for="treeItem in viewModel.TreeDatas"
        :key="treeItem.Name"
        class="cursor-pointer h-15 text-center mt-10 treeItem"
        :class="{ selectItem: viewModel.SelectTreeItem.Name == treeItem.Name }"
        @click="changeTreeItem(treeItem)"
      >
        <hi-icon class="text-xl" :icon-name="treeItem.IconName" />
        <div class="text-sm mt-10px">{{ treeItem.Name }}</div>
      </div>
      <div class="absolute left-0 bottom-0 h-50px leading-50px text-center z-1 w-20">
        <SettingOutlined
          title="系统设置"
          :style="{ fontSize: '20px', cursor: 'pointer' }"
          @click="openSettingManagement"
        />
      </div>
    </div>
    <div class="flex-1 border-[1px] flex flex-col">
      <div>
        <div class="title" v-text="viewModel.SelectTreeItem.Name"></div>
        <div class="flex ml-10px mr-10px">
          <div class="flex-auto">
            <a-input-search
              v-model:value="viewModel.SelectTreeItem.SearchKey"
              class="h-40px float-left"
              enter-button
              @search="search(viewModel.SelectTreeItem)"
            />
          </div>
          <div v-if="viewModel.SelectTreeItem.AddRouterName" class="ml-10px">
            <authority-waper
              :res-id="viewModel.SelectResId"
              :operate-id="viewModel.SelectOperateId"
              :hide-panel="true"
            >
              <a-button
                class="float-right bg-[#F3F3F3] border-0"
                size="middle"
                @click="openAdd(viewModel.SelectTreeItem)"
              >
                <template #icon>
                  <hi-icon
                    class="text-xl text-[#999999]"
                    icon-name="icon-a-HiSqlGUIICON_zengjia"
                  ></hi-icon>
                </template>
              </a-button>
            </authority-waper>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden">
        <RecycleScroller
          v-if="
            viewModel.SelectTreeItem &&
            viewModel.SelectTreeItem.FilterData &&
            viewModel.SelectTreeItem.FilterData.length > 0
          "
          v-slot="{ item }"
          class="scroller"
          :items="viewModel.SelectTreeItem.FilterData"
          :item-size="40"
          key-field="Id"
        >
          <div
            :title="currentTableSimple"
            class="tableNameItem"
            :class="{ selectSpan: viewModel.SelectItem.Id == item.Id }"
            @click="goPage(viewModel.SelectTreeItem, item)"
            @mouseenter="getTableSimpleName(viewModel.SelectTreeItem, item)"
          >
            <!-- <hi-icon class="text-xl" icon-name="icon-a-HiSqlGUIICON_shujubiao-xiankuang"></hi-icon> -->
            <span
              class="overflow-ellipsis overflow-hidden inline-block w-[calc(100%-30px)] whitespace-nowrap"
              v-text="item.Name"
            />
          </div>
          <!-- <div
          class="tableNameItem"
          :title="item.Name"
          @click="goPage(viewModel.SelectTreeItem, item)"
        >
          <span :class="{ selectSpan: viewModel.SelectItem == item }" v-text="item.Name"></span>
        </div> -->
        </RecycleScroller>
      </div>
      <div class="h-40px overflow-hidden p-8px box-border border-t">
        <!-- <div class="float-left">
          <a-select size="small" v-model:value="value3">
            <a-select-option value="lucy">Lucy</a-select-option>
          </a-select>
        </div>-->
        <div class="float-left">共{{ total }}条</div>
        <!-- <div class="float-right">
          <a-pagination
            v-model:current="current"
            v-model:page-size="pageSize2"
            size="small"
            :page-size-options="pageSizeOptions"
            show-size-changer
            :total="total"
            show-less-items
            simple
            @showSizeChange="onShowSizeChange"
            @change="onChange"
          />
        </div> -->
      </div>
    </div>
  </div>
  <!-- <a-collapse v-model:activeKey="viewModel.ActiveKey">
    <a-collapse-panel
      v-for="treeItem in viewModel.TreeDatas"
      :key="treeItem.Name"
      :header="treeItem.Name"
    >
      <template #extra>
        <div @click.stop>
          <a-input-search
            v-model:value="treeItem.SearchKey"
            size="small"
            style="width: 120px"
            @search="search(treeItem)"
          />
        </div>
      </template>
      <div class="h-200px overflow-hidden">
        <RecycleScroller
          v-if="treeItem.FilterData.length > 0"
          v-slot="{ item }"
          class="scroller"
          :items="treeItem.FilterData"
          :item-size="25"
          key-field="Id"
        >
          <div class="tableNameItem" :title="item.Name" @click="goPage(treeItem, item)">
            <span :class="{ selectSpan: viewModel.SelectItem == item }" v-text="item.Name"></span>
          </div>
        </RecycleScroller>
      </div>
    </a-collapse-panel>
  </a-collapse> -->
  <div v-if="isSettingManagement" class="w-full h-full fixed top-0 left-0 z-30 bg-[#ffffff]">
    <Settingmain
      v-if="isSettingManagement"
      @closedPermissionManagement="closedSettingManagement"
    ></Settingmain>
  </div>
</template>
<script setup lang="ts">
import { SettingOutlined } from '@ant-design/icons-vue';
import { TreeDataItem } from 'ant-design-vue/lib/tree';
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { LeftMenuViewModel, dataItem, ModuleItem, SelectItemType } from './leftMenuViewModel';
import { MyIcon } from '@/components/Icon/hiIconViewModel';
import { store } from '@/store';
import { getTableSimple } from '../../serverApi/tableInfoAPIs';
import config from '@/serverApi/config';
import authorityWaper from '../authority/authorityWaper.vue';
import { PageSignItem, pageSignPiniaStore } from '@/store/pageSignPiniaStore';

const pageSign = pageSignPiniaStore();
const isSettingManagement = ref(false);
// eslint-disable-next-line no-undef
const props = defineProps({
  /**
   * 点击页签更新菜单选中数据
   */
  propSelectItem: {
    type: Object,
    required: true,
  },
});
const currentTableSimple = ref('');
const current = ref(1);
const pageSize2 = ref<number>(20);
const total = ref<number>(0);
const pageSizeOptions = ref<string[]>(['10', '20', '30', '40', '50']);
// eslint-disable-next-line no-undef
const router = useRouter();
const viewModel = reactive(new LeftMenuViewModel());
viewModel.init();
watch(
  () => props.propSelectItem,
  v => {
    // 页签点击跳转
    if (props.propSelectItem) {
      viewModel.SelectItem = props.propSelectItem as dataItem;
      if (props.propSelectItem.Name && props.propSelectItem.Name.indexOf('_新增') < 0) {
        // const CurrentTab = store.getters.getCurrentTab();

        const CurrentTab = pageSign.getCurrentTab();
        if (CurrentTab.Content) {
          viewModel.SetSelectTreeItemByName((CurrentTab.Content as ModuleItem).Name);
        }
        const obj = {
          Name: '',
          Id: '',
        } as dataItem;
        obj.Name = props.propSelectItem.Name;
        obj.Id = props.propSelectItem.Id;
        viewModel.SelectTreeItem.GoPage(router, obj);
      }
    }
  },
  { deep: true },
);
watch(
  () => viewModel.TreeDatas,
  v => {
    // eslint-disable-next-line no-undef
    // 监听数据表初始加载条数
    if (viewModel.TreeDatas.length) {
      total.value = viewModel.TreeDatas[0].FilterData.length;
    }
  },
  { deep: true },
);
// watch(
//   () => store.getters.getCurrentTab(),
//   v => {
//     if (Object.keys(v).length === 0) {
//       viewModel.SelectItem = {};
//     }
//   },
//   { deep: true },
// );
watch(
  () => pageSign.getCurrentTab(),
  v => {
    if (Object.keys(v).length === 0) {
      viewModel.SelectItem = {};
    }
  },
  { deep: true },
);
watch(viewModel.SelectTreeItem, () => {
  viewModel.SelectResId = viewModel.SelectTreeItem.AuthConfig.Add.ResId;
  viewModel.SelectOperateId = viewModel.SelectTreeItem.AuthConfig.Add.OperateId;
});
// F5刷新后赋值缓存选中的二级菜单
// if (store.getters.getCurrentTab()) {
//   const CurrentTab = store.getters.getCurrentTab();
//   if (CurrentTab.Content) {
//     viewModel.SetSelectTreeItemByName((CurrentTab.Content as ModuleItem).Name);
//   }
//   viewModel.SelectItem = CurrentTab;
// }
if (pageSign.getCurrentTab()) {
  const CurrentTab = pageSign.getCurrentTab();
  if (CurrentTab.Content) {
    viewModel.SetSelectTreeItemByName((CurrentTab.Content as ModuleItem).Name);
  }
  viewModel.SelectItem = CurrentTab;
}
const getTableSimpleName = async (treeItem: ModuleItem, item: dataItem) => {
  if (treeItem && (treeItem.Name === '数据表' || treeItem.Name === '视图')) {
    const tableSimpleNameListStr = localStorage.getItem('tableSimpleNameListKey');
    let tableSimpleNameList = [];
    if (tableSimpleNameListStr) {
      tableSimpleNameList = JSON.parse(tableSimpleNameListStr);
      const lst = tableSimpleNameList.filter((r: { type: string; name: string }) => {
        return r.type === treeItem.Name && r.name === item.Name;
      });
      if (lst && !!lst.length) {
        currentTableSimple.value = lst[0].tabDescript;
      } else {
        const firstObj = await getTableSimple(item.Name);
        currentTableSimple.value =
          firstObj && firstObj.TabDescript ? firstObj.TabDescript : item.Name;
        tableSimpleNameList.push({
          type: treeItem.Name,
          name: item.Name,
          tabDescript: firstObj && firstObj.TabDescript ? firstObj.TabDescript : item.Name,
        });
        localStorage.setItem('tableSimpleNameListKey', JSON.stringify(tableSimpleNameList));
      }
    } else {
      const firstObj = await getTableSimple(item.Name);
      currentTableSimple.value =
        firstObj && firstObj.TabDescript ? firstObj.TabDescript : item.Name;
      tableSimpleNameList.push({
        type: treeItem.Name,
        name: item.Name,
        tabDescript: firstObj && firstObj.TabDescript ? firstObj.TabDescript : item.Name,
      });
      localStorage.setItem('tableSimpleNameListKey', JSON.stringify(tableSimpleNameList));
    }
  } else {
    currentTableSimple.value = item.Name;
  }
};

const changeTreeItem = (treeItem: ModuleItem) => {
  viewModel.SelectTreeItem = treeItem;
  // Object.assign(viewModel.SelectTreeItem, treeItem);
  // 设置菜单给页签作为类型
  // store.commit('setCurrentMenuType', treeItem.Name);
  pageSign.setCurrentMenuType(pageSign.$state, treeItem.Name);
  let currentTab = {} as dataItem;
  // if (store.getters.getTabsMenues().length > 0) {

  const tabsMenues: any = pageSign.getTabsMenues('');
  if (tabsMenues.length > 0) {
    // eslint-disable-next-line prefer-destructuring
    currentTab = tabsMenues[0];
  } else {
    // eslint-disable-next-line no-lonely-if
    if (treeItem.Childrens.length > 0) {
      // eslint-disable-next-line prefer-destructuring, @typescript-eslint/no-unused-vars
      currentTab = treeItem.Childrens[0];
    } else {
      total.value = 0;
      // store.commit('setCurrentTab', {});

      pageSign.setCurrentTab(pageSign.$state, {});
      router.push({ name: 'emptypage' });
      return;
    }
  }
  // eslint-disable-next-line prettier/prettier
  // store.commit('setCurrentTab', currentTab);
  pageSign.setCurrentTab(pageSign.$state, currentTab);
  const obj = {
    Name: '',
    Id: '',
  } as dataItem;

  obj.Name = currentTab.Name;
  obj.Id = currentTab.Id;
  // treeItem.GoPage(router, obj);
  // eslint-disable-next-line no-extra-boolean-cast
  if (!!obj.Name) {
    // eslint-disable-next-line no-use-before-define
    goPage(treeItem, obj);
  }
  total.value = treeItem.FilterData.length;
};
const goPage = (treeItem: ModuleItem, item: dataItem) => {
  if (!treeItem) {
    return;
  }
  // store.commit('setCurrentMenuType', treeItem.Name);

  pageSign.setCurrentMenuType(pageSign.$state, treeItem.Name);

  // eslint-disable-next-line no-use-before-define
  addPageSign(item, treeItem);
  viewModel.SelectItem = item;
  if (item.Name.indexOf('_新增') >= 0) {
    router.push({ name: item.Id });
  } else {
    treeItem.GoPage(router, item);
  }
};
/**
 * 添加页签
 */
const addPageSign = (item: { Name: string; Id: string }, treeItem: ModuleItem) => {
  // const lst: Array<PageSignItem> = pageSignStore.state.tabsMenues.filter(
  //   (x: { Type: any }) => x.Type === pageSignStore.state.currentMenuType,
  // );
  debugger;
  const lst: Array<PageSignItem> = pageSign.tabsMenues.filter(
    (x: { Type: any }) => x.Type === pageSign.currentMenuType,
  );

  const pageSignItem = new PageSignItem();
  pageSignItem.Name = item.Name;
  pageSignItem.Id = item.Id;
  pageSignItem.Type = treeItem.Name;
  pageSignItem.Content = treeItem;
  pageSignItem.Data = {};
  if (lst && lst.length < config.MaxTabsLength) {
    // store.commit('addTabs', pageSignItem);
    pageSign.addTabs(pageSign.$state, pageSignItem);
  }
  // store.commit('setCurrentTab', pageSignItem);
  pageSign.setCurrentTab(pageSign.$state, pageSignItem);
};

const search = (treeItem: ModuleItem) => {
  treeItem.FilterData.splice(0);
  // eslint-disable-next-line no-undef
  nextTick(() => {
    // RecycleScroller 无法感知数据变化,只能先将数据归零让他重新渲染一次
    viewModel.search(treeItem);
  });
};
const onShowSizeChange = (current: number, pageSize: number) => {
  console.log(current, pageSize);
};
const onChange = (pageNumber: number) => {
  console.log('Page: ', pageNumber);
};
const openAdd = (treeItem: ModuleItem) => {
  router.push({ name: treeItem.AddRouterName });
  const obj = {
    Name: '',
    Id: '',
  } as dataItem;
  // eslint-disable-next-line prefer-template
  obj.Name = treeItem.Name + '_新增';
  // eslint-disable-next-line prefer-template
  obj.Id = treeItem.AddRouterName;
  addPageSign(obj, treeItem);
  // store.commit('setCurrentMenuType', treeItem.Name);
  // store.commit('setCurrentTab', obj);
  // viewModel.SelectItem = store.getters.getCurrentTab();
  debugger;
  pageSign.setCurrentMenuType(pageSign.$state, treeItem.Name);
  pageSign.setCurrentTab(pageSign.$state, obj);
  viewModel.SelectItem = pageSign.getCurrentTab();
};

// 打开设置管理
const openSettingManagement = () => {
  isSettingManagement.value = true;
};
// 关闭权设置管理
const closedSettingManagement = () => {
  isSettingManagement.value = false;
};
</script>
<style lang="less">
.ant-collapse-content-box {
  padding: 0 !important;
}
</style>
<style scoped lang="less">
.scroller {
  height: 100%;
  overflow: auto;
}

.ant-collapse-content > .ant-collapse-content-box {
  padding-right: 0px;
}

.tableNameItem {
  cursor: pointer;
  padding-left: 10px;
  // padding-top: 4px;
  height: 40px;
  line-height: 40px;
  border-radius: 2px;
  margin: 0 8px;
  border-radius: 4px;
  color: #191919;
  width: 100%;
  box-sizing: border-box;

  & > span.anticon {
    color: #5c5c5d;
    margin-right: 10px;
  }
}

.tableNameItem .anticon {
  vertical-align: 0.6rem;
}

.selectSpan {
  background-color: #eff0f9;
  color: #3144f5;

  & > span.anticon {
    color: #3144f5;
  }
}

.treeItem {
  color: #979899;
}

.selectItem {
  color: #3144f5;
}

.title {
  font-size: 18px;
  color: #323232;
  font-weight: 700;
  text-align: left;
  letter-spacing: 0.4px;
  height: 25px;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-left: 20px;
}
</style>
