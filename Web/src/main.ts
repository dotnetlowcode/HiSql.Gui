import './assets/css/github.less'; // 代码高亮样式
import './assets/css/base.less';
import 'virtual:windi.css';
import 'highlight.js/styles/obsidian.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import 'ant-design-vue/dist/antd.less';
import 'vxe-table/lib/style.css';

import { createApp } from 'vue';

import Antd, { ConfigProvider } from 'ant-design-vue';
import { createPinia } from 'pinia'; // 从pinia中导入createPinia方法
import piniaPluginPersist from 'pinia-plugin-persist';
// eslint-disable-next-line prettier/prettier
import {
  DynamicScroller,
  DynamicScrollerItem,
  RecycleScroller,
} from 'vue-virtual-scroller';
import VXETable from 'vxe-table';

import App from './App.vue';
import router from './router';
import { store } from './store';

const app = createApp(App);

function useTable(app: { use: (arg0: typeof import('vxe-table/types/all')) => void }) {
  app.use(VXETable);
  // 给 vue 实例挂载内部对象，例如：
  // app.config.globalProperties.$XModal = VXETable.modal
  // app.config.globalProperties.$XPrint = VXETable.print
  // app.config.globalProperties.$XSaveFile = VXETable.saveFile
  // app.config.globalProperties.$XReadFile = VXETable.readFile
}
const piniaStore = createPinia();
piniaStore.use(piniaPluginPersist);
app.component('DynamicScroller', DynamicScroller);
app.component('DynamicScrollerItem', DynamicScrollerItem);
app.component('RecycleScroller', RecycleScroller);
app
  .use(Antd)
  .use(store)
  .use(router)
  .use(ConfigProvider)
  .use(useTable)
  .use(piniaStore)
  .mount('#app');
