import router from '@/router';

import { store } from '..';

// export class PageSignItem {
//   /**
//    * 类型
//    */
//   Type = '';

//   /**
//    * 内容
//    */
//   Content: ModuleItem | undefined;

//   /**
//    * Name
//    */
//   Name = '';

//   /**
//    * Id
//    */
//   Id = '';

//   /**
//    * 是否显示删除按钮
//    */
//   Closable = false;

//   /**
//    * 缓存数据
//    */
//   Data!: any;
// }

/* eslint-disable prettier/prettier */
const pageSignStore = {
  state: {
    tabsMenues: [], // 全部页签列表
    currentTab: {}, // 当前选中的页签
    currentMenuType: '', // 主菜单类型
  },
  mutations: {
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
        const Tabs = localStorage.getItem('tabsMenues');
        if (Tabs) {
          perTabs = JSON.parse(Tabs) || [];
        }
      }
      // const lst: Array<PageSignItem> = perTabs.filter(x => x.Type === state.currentMenuType);
      // if (lst && lst.length > 5) {
      //   return;
      // }

      const IsHasTab = perTabs.findIndex(t => t.Id === data.Id && t.Name === data.Name);
      if (IsHasTab < 0) {
        const lst = [data];
        state.tabsMenues = [...perTabs, ...lst];
      } else {
        perTabs[IsHasTab] = data;
        state.tabsMenues = perTabs;
      }
      // localStorage.setItem('tabsMenues', JSON.stringify(state.tabsMenues));
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
      },
      tabs: any,
    ) {
      if (!tabs || typeof tabs !== 'object') return;
      let perTabs: Array<PageSignItem> = state.tabsMenues;
      if (perTabs.length === 0) {
        const perTabStr = localStorage.getItem('tabsMenues');
        if (perTabStr) {
          perTabs = JSON.parse(perTabStr) || [];
        }
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
      // localStorage.setItem('tabsMenues', JSON.stringify(state.tabsMenues));
      const list = state.tabsMenues.filter(x => x.Type === state.currentMenuType);
      if (!list || list.length === 0) {
        router.push({ name: 'emptypage' });
        store.commit('setCurrentTab', {});
      }
    },
    /**
     * 清空页签
     * @param state
     * @param tabs
     */
    clearTabs(state: { tabsMenues: Array<PageSignItem> }, tabs: any) {
      state.tabsMenues = [];

      // localStorage.setItem('tabsMenues', JSON.stringify(state.tabsMenues));
    },
    /**
     * 设置当前页签
     * @param state
     * @param tab
     * @returns
     */
    setCurrentTab(state: { currentTab: any }, tab: any) {
      if (!tab || typeof tab !== 'object') return;
      state.currentTab = tab;
      // localStorage.setItem(`${window.location.origin}_tabs`, JSON.stringify(tab));
    },
    /**
     * 设置当前菜单类型
     * @param state
     * @param tab
     * @returns
     */
    setCurrentMenuType(state: { currentMenuType: string }, value: string) {
      state.currentMenuType = value;
      // localStorage.setItem(`${window.location.origin}_currentMenuType`, value);
    },
    /**
     * 清除最后一个Tab
     * @param state
     * @param value
     */
    removeLastTab(
      state: {
        currentMenuType: string;
        tabsMenues: Array<PageSignItem>;
      },
      value: any,
    ) {
      const tabList = state.tabsMenues.filter(r => r.Type === state.currentMenuType);
      if (tabList.length > 0) {
        const lastObj = tabList[tabList.length - 1];
        state.tabsMenues.splice(state.tabsMenues.indexOf(lastObj), 1);
      }
    },
  },

  actions: {},
  getters: {
    getTabsMenues:
      (state: { tabsMenues: PageSignItem[]; currentMenuType: string }) => (_Id: string) => {
        let perms: Array<PageSignItem> = state.tabsMenues;
        if (!perms || perms.length === 0) {
          const temp = localStorage.getItem('tabsMenues');
          if (temp) {
            perms = JSON.parse(temp);
          }
        }
        if (!state.currentMenuType) {
          const currentMenuType = localStorage.getItem('currentMenuType');
          if (!currentMenuType) {
            store.commit('removeTabs', []);
            store.commit('setCurrentTab', {});
            return [];
          }
          state.currentMenuType = currentMenuType;
        }
        perms = perms.filter(x => x.Type === state.currentMenuType);

        if (!_Id) return perms;
        return perms.find(x => x.Id === _Id);
      },
    getCurrentTab: (state: any) => () => {
      let perm = state.currentTab;
      if (Object.keys(perm).length === 0) {
        const temp = localStorage.getItem(`${window.location.origin}_tabs`);
        if (temp) {
          perm = JSON.parse(temp);
        }
      }

      return perm;
    },
    getCurrentMenuType: (state: { currentMenuType: string }) => () => {
      let perm = state.currentMenuType;
      if (!perm) {
        perm = localStorage.getItem(`${window.location.origin}_currentMenuType`) || '';
      }
      return perm;
    },
  },
};
export default pageSignStore;
