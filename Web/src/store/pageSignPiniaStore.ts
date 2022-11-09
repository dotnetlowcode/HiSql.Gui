/* eslint-disable no-use-before-define */
import { defineStore } from 'pinia'; // 从pinia中导入，defineStore方法，用于定义一个新的store

import { ModuleItem } from '@/components/leftMenu/leftMenuViewModel';
import router from '@/router';

export const pageSignPiniaStore = defineStore('pageSign', {
  // 使用defineStore方法定义store
  state() {
    // state表示这个store里的状态，也就是存放数据的地方
    return {
      tabsMenues: [], // 全部页签列表
      // eslint-disable-next-line no-use-before-define
      currentTab: {} as PageSignItem, // 当前选中的页签
      currentMenuType: '', // 主菜单类型
      cacheComponentName: [] as Array<string>, // 需要缓存的组件名
    };
  },
  getters: {
    getTabsMenues:
      (state: { currentTab: any; tabsMenues: Array<PageSignItem>; currentMenuType: string }) =>
      (_Id: string) => {
        let perms: Array<PageSignItem> = state.tabsMenues || [];

        if (!state.currentMenuType) {
          const pageSign = pageSignPiniaStore();
          pageSign.removeTabs(state, []);
          pageSign.setCurrentTab(state, {});
          return [];
        }
        perms = perms.filter(x => x.Type === state.currentMenuType);

        if (!_Id) {
          return perms || [];
        }
        return perms.find(x => x.Id === _Id);
      },
    getCurrentTab: (state: any) => () => {
      return state.currentTab;
    },
    getCurrentMenuType: (state: { currentMenuType: string }) => () => {
      return state.currentMenuType;
    },
  },
  actions: {
    /**
     * 添加页签
     * @param state
     * @param data
     * @returns
     */
    addTabs(
      state: { tabsMenues: Array<PageSignItem>; currentMenuType: string },
      data: PageSignItem,
    ) {
      if (!data || typeof data !== 'object') return;
      let perTabs = state.tabsMenues;
      if (!perTabs || perTabs.length === 0) {
        perTabs = [];
      }
      const IsHasTab = perTabs.findIndex(t => t.Id === data.Id && t.Name === data.Name);
      if (IsHasTab < 0) {
        const lst = [data];
        state.tabsMenues = [...perTabs, ...lst];
      } else {
        perTabs[IsHasTab] = data;
        state.tabsMenues = perTabs;
      }
    },
    /**
     * 移除页签
     * @param state
     * @param tabs
     */
    removeTabs(
      state: {
        currentMenuType: string;
        tabsMenues: Array<PageSignItem>;
        currentTab: any;
      },
      tabs: any,
    ) {
      if (!tabs || typeof tabs !== 'object') return;
      let perTabs: Array<PageSignItem> = state.tabsMenues;
      if (perTabs.length === 0) {
        perTabs = [];
      }
      const newTabs: Array<PageSignItem> = [];
      perTabs.forEach(tab => {
        const Idx: number = tabs.findIndex(
          (x: { Id: string; Name: string }) => x.Id === tab.Id && x.Name === tab.Name,
        );
        if (Idx === -1) {
          newTabs.push(tab);
        }
        state.tabsMenues = newTabs;
      });
      const list = state.tabsMenues.filter(x => x.Type === state.currentMenuType);
      if (!list || list.length === 0) {
        router.push({ name: 'emptypage' });
        const pageSign = pageSignPiniaStore();
        pageSign.setCurrentTab(state, {});
      }
    },
    /**
     * 清空页签
     * @param state
     * @param tabs
     */
    clearTabs(state: { tabsMenues: Array<PageSignItem> }, tabs: any) {
      state.tabsMenues = [];
    },
    /**
     * 设置当前页签
     * @param state
     * @param tab
     * @returns
     */
    setCurrentTab(
      state: { currentTab: any; tabsMenues: PageSignItem[]; currentMenuType: string },
      tab: any,
    ) {
      if (!tab || typeof tab !== 'object') return;
      state.currentTab = tab;
    },
    /**
     * 设置当前菜单类型
     * @param state
     * @param tab
     * @returns
     */
    setCurrentMenuType(state: { currentMenuType: string }, value: string) {
      state.currentMenuType = value;
    },
    /**
     * 清除最后一个Tab
     * @param state
     */
    removeLastTab(state: { currentMenuType: string; tabsMenues: Array<PageSignItem> }) {
      const tabList = state.tabsMenues.filter(r => r.Type === state.currentMenuType);
      if (tabList.length > 0) {
        const lastObj = tabList[tabList.length - 1];
        state.tabsMenues.splice(state.tabsMenues.indexOf(lastObj), 1);
      }
    },
  },
  // 开启数据缓存
  persist: {
    enabled: true,
  },
});

export class PageSignItem {
  /**
   * 类型
   */
  Type = '';

  /**
   * 内容
   */
  Content: ModuleItem | undefined;

  /**
   * Name
   */
  Name = '';

  /**
   * Id
   */
  Id = '';

  /**
   * 是否显示删除按钮
   */
  Closable = false;

  /**
   * 缓存数据
   */
  Data!: any;
}
