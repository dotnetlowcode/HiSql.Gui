<template>
  <div class="ml-16px mr-16px mt-8px h-40px pageSign">
    <a-tabs
      v-model:activeKey="pageSign.getCurrentTab().Id"
      type="editable-card"
      hide-add
      @tab-click="
        (id:any) => {
          selectNav(id);
        }
      "
    >
      <a-tab-pane v-for="(tab, tabIndex) in tabsMenuesList" :key="tab.Id" :closable="false">
        <!-- :tab="tab.Name" -->
        <template #tab>
          <div class="pageSign-item" @contextmenu.prevent="openMoredBtn($event, tabIndex)">
            <div class="tab__name" :title="tab.Name">{{ tab.Name }}</div>
            <div class="tab__icon" @click.stop="closedcurrentTab($event, tabIndex)">
              <close-circle-two-tone two-tone-color="#bbbbbb" />
            </div>
          </div>
        </template>
      </a-tab-pane>
    </a-tabs>
    <div v-show="isShowDropDownMenu" id="menu" ref="dropDownMenuBox" class="dropDownMenu">
      <a-menu>
        <a-menu-item
          v-for="item in tabsHandles"
          :key="item.value"
          @click.stop="removeTab(item.value)"
        >
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
// 页签
import { CloseCircleTwoTone } from '@ant-design/icons-vue';
import router from '@/router';
import { store } from '@/store';
import { dataItem, LeftMenuViewModel, ModuleItem } from '@/components/leftMenu/leftMenuViewModel';
import { pageSignPiniaStore, PageSignItem } from '@/store/pageSignPiniaStore';

const pageSign = pageSignPiniaStore();
// watch(
//   () => router,
//   v => {
//     // eslint-disable-next-line no-undef
//   },
// );
const tabsHandles = ref([
  // {
  //   icon: '',
  //   label: '关闭当前标签页',
  //   value: '1',
  // },
  {
    icon: '',
    label: '关闭左侧标签页',
    value: '2',
  },
  {
    icon: '',
    label: '关闭右侧标签页',
    value: '3',
  },
  {
    icon: '',
    label: '关闭其他标签页',
    value: '4',
  },
  {
    icon: '',
    label: '关闭全部签页',
    value: '5',
  },
]);
debugger;
const dropDownMenuBox = ref();
const isShowDropDownMenu = ref(false);
const handleTabIndex = ref(); // 删除操作选择的tab的索引
const selectIndex = ref(0);
const viewModel = reactive(new LeftMenuViewModel());

const tabsMenuesList = ref();
debugger;
tabsMenuesList.value = pageSign.getTabsMenues('');
debugger;

watch(
  () => pageSign.tabsMenues,
  list => {
    debugger;
    tabsMenuesList.value = pageSign.getTabsMenues('');
  },
  { deep: true },
);

const emits = defineEmits([`update:param-list`]);
const goPage = (params: PageSignItem) => {
  const obj = {
    Name: '',
    Id: '',
  } as dataItem;
  obj.Name = params?.Name;
  obj.Id = params?.Id;
  // const treeItem = params.Content;
  emits('update:param-list', obj);
  if (obj.Name && obj.Name.indexOf('_新增') >= 0) {
    router.push({ name: obj.Id });
  }
  // else if (treeItem && treeItem.GoPage !== undefined) {
  //   treeItem.GoPage(router, obj);
  // }
};
// 关闭右键菜单
const closeRightMenu = () => {
  isShowDropDownMenu.value = false;
  // 及时关掉鼠标监听事件
  document.removeEventListener('click', closeRightMenu);
};

// 打开更多操作
const openMoredBtn = (event: any, tabIndex: number) => {
  isShowDropDownMenu.value = true;
  dropDownMenuBox.value.style.top = `${event.clientY + 20}px`;
  dropDownMenuBox.value.style.left = `${event.clientX - 120}px`;
  dropDownMenuBox.value.style.display = 'block';
  // 给整个document添加监听鼠标事件，点击任何位置执行closeRightMenu方法，及时将菜单关闭
  document.addEventListener('click', () => {
    closeRightMenu();
  });
  handleTabIndex.value = tabIndex;
};
// 关闭当前tab
const closedcurrentTab = (event: any, tabIndex: number) => {
  handleTabIndex.value = tabIndex;
  // eslint-disable-next-line no-use-before-define
  removeTab('1');
};

// 点击切换页签
const selectNav = (Id: string) => {
  isShowDropDownMenu.value = false;
  // const tabslist = store.getters.getTabsMenues();
  const tabslist: any = pageSign.getTabsMenues('');
  const i = tabslist.findIndex((x: { Id: any }) => x.Id === Id);
  if (i >= 0) {
    selectIndex.value = i;
    // store.commit('setCurrentTab', tabslist[i]);
    pageSign.setCurrentTab(pageSign.$state, tabslist[i]);
    // 点击页签跳转
    goPage(tabslist[i]);
  }
};
// 删除页签
const removeTab = (_handleType: string) => {
  isShowDropDownMenu.value = false;
  // const hasTabs: Array<PageSignItem> = store.getters.getTabsMenues();
  // const handleTab = store.getters.getTabsMenues()[handleTabIndex.value];
  // const currentTab = store.getters.getCurrentTab();
  const tabsMenues: any = pageSign.getTabsMenues('');
  const hasTabs: any = tabsMenues;
  const handleTab = tabsMenues[handleTabIndex.value];
  const currentTab = pageSign.getCurrentTab();
  const currentTabIndex = hasTabs.findIndex(
    (t: { Id: any; Name: any }) => t.Id === currentTab.Id && t.Name === currentTab.Name,
  );
  let removeAfterSelectTab: PageSignItem | null | object = null;
  let colseTabs: Array<PageSignItem> = [];
  switch (_handleType) {
    case '1': // 当前
      colseTabs = hasTabs.filter((x: any, y: number) => y === handleTabIndex.value);
      if (handleTab.Id === currentTab.Id) {
        if (handleTabIndex.value === 0) {
          const firstObj = hasTabs[1];
          removeAfterSelectTab = firstObj;
        } else {
          // 当前选中tab被删除，索引加1默认选中
          removeAfterSelectTab = hasTabs[handleTabIndex.value - 1];
        }
      }
      break;
    case '2': {
      // 左侧
      colseTabs = hasTabs.filter((x: any, y: number) => y < handleTabIndex.value);
      if (handleTab.Id !== currentTab.Id) {
        if (handleTabIndex.value > 0) {
          const firstObj = hasTabs[1];
          removeAfterSelectTab = firstObj;
          // 如果选择的tab被删除，操作的tab默认选中
          if (handleTabIndex.value > currentTabIndex) {
            removeAfterSelectTab = hasTabs[handleTabIndex.value];
          }
        }
      }
      break;
    }
    case '3': {
      // 右侧
      colseTabs = hasTabs.filter((x: any, y: number) => y > handleTabIndex.value);
      if (handleTab.Id !== currentTab.Id) {
        // 如果选择的tab被删除，操作的tab默认选中
        if (handleTabIndex.value < currentTabIndex) {
          removeAfterSelectTab = hasTabs[handleTabIndex.value];
        }
      }
      break;
    }
    case '4': // 其它
      colseTabs = hasTabs.filter((x: any, y: number) => y !== handleTabIndex.value);
      removeAfterSelectTab = handleTab;
      break;
    case '5': // 全部
      colseTabs = hasTabs;
      removeAfterSelectTab = {};
      break;
    default:
      break;
  }
  // store.commit('removeTabs', colseTabs);
  pageSign.removeTabs(pageSign.$state, colseTabs);
  // 删除后自动设置默认选中页签
  if (removeAfterSelectTab !== null) {
    // store.commit('setCurrentTab', removeAfterSelectTab);
    pageSign.setCurrentTab(pageSign.$state, removeAfterSelectTab);
    // if (store.getters.getTabsMenues().length) {
    if (tabsMenues.length) {
      // selectId.value = removeAfterSelectTab.Id;
      // 点击页签跳转
      goPage(removeAfterSelectTab as PageSignItem);
    }
  }
};
</script>
<style lang="less" scoped>
.chartProps {
  position: relative;
}

::v-deep(.ant-tabs-top > .ant-tabs-nav, .ant-tabs-bottom > .ant-tabs-nav, .ant-tabs-top
    > div
    > .ant-tabs-nav, .ant-tabs-bottom > div > .ant-tabs-nav) {
  margin: 0;
}

::v-deep(.ant-tabs-card.ant-tabs-top
    > .ant-tabs-nav
    .ant-tabs-tab
    + .ant-tabs-tab, .ant-tabs-card.ant-tabs-bottom
    > .ant-tabs-nav
    .ant-tabs-tab
    + .ant-tabs-tab, .ant-tabs-card.ant-tabs-top
    > div
    > .ant-tabs-nav
    .ant-tabs-tab
    + .ant-tabs-tab, .ant-tabs-card.ant-tabs-bottom
    > div
    > .ant-tabs-nav
    .ant-tabs-tab
    + .ant-tabs-tab) {
  margin-left: 0;
}
::v-deep(.ant-tabs-tab) {
  position: relative;
}
::v-deep(.ant-menu-vertical > .ant-menu-item) {
  height: 30px;
  line-height: 30px;
  margin-bottom: 5px;
  color: #666;
}
.pageSign {
  width: calc(100% - 16px);
  padding-right: 16px;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  .pageSign-item {
    display: flex;
    padding-right: 20px;
    box-sizing: border-box;
    position: relative;
    .tab__name {
    }
    .tab__icon {
      position: absolute;
      z-index: 1;
      right: -18px;
      top: 0;
      &:hover {
        .anticon {
          transform: scale(1.5);
        }
      }
    }
  }
}

.dropDownMenu {
  position: absolute;
  z-index: 999;
}
</style>
