import './assets/css/github.less'; // 代码高亮样式
import './assets/css/base.less';
import 'virtual:windi.css';
import 'highlight.js/styles/obsidian.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import 'ant-design-vue/dist/antd.less';

import { createApp } from 'vue';

import Antd, { ConfigProvider } from 'ant-design-vue';
import {
  DynamicScroller,
  DynamicScrollerItem,
  RecycleScroller,
} from 'vue-virtual-scroller';

import App from './App.vue';
import router from './router';
import { store } from './store';

const app = createApp(App);
app.component('DynamicScroller', DynamicScroller);
app.component('DynamicScrollerItem', DynamicScrollerItem);
app.component('RecycleScroller', RecycleScroller);
app.use(Antd).use(store).use(router).use(ConfigProvider).mount('#app');
