import { defineConfig } from 'vite';
import pkg from './package.json';
import vue from '@vitejs/plugin-vue';
import PkgConfig from 'vite-plugin-package-config';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import OptimizationPersist from 'vite-plugin-optimize-persist';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import vueJsx from '@vitejs/plugin-vue-jsx';
import WindiCSS from 'vite-plugin-windicss';
import visualizer from 'rollup-plugin-visualizer';
import vueSetupExtend from 'vite-plugin-vue-setup-extend'

let basePath = './';
if (process.env.APP_ENV == 'production') {
  basePath = './'; //如果有CDN可以配置CND路径,如:`http://cnd.aliyun.com/app/`
}
// https://vitejs.dev/config/
export default defineConfig({
  base: basePath,
  server: {
    host: '0.0.0.0',
  },
  define: {
    PKG: JSON.stringify(pkg.dependencies),
  },
  plugins: [
    vue(),
    vueSetupExtend(),
    vueJsx({
      // options are passed on to @vue/babel-plugin-jsx
    }),
    WindiCSS(),
    AutoImport({
      dts: 'src/auto-imports.d.ts',
      imports: ['vue', 'vue-router'],
    }),
    Components({
      dts: 'src/components.d.ts',
      deep: true,
      dirs: ['src/components'],
      extensions: ['vue', 'tsx'],
      resolvers: [
        AntDesignVueResolver({
          importStyle: 'less',
          importLess: true,
        }),
      ],
    }),
    PkgConfig(),
    OptimizationPersist(),
    visualizer({
      open: true, //注意这里要设置为true，否则无效
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@antv/x6',
        replacement: '@antv/x6/dist/x6.js',
      },
      {
        find: '@',
        replacement: `/src/`,
      },
    ],
  },
  css: {
    preprocessorOptions: {
      less: {
        // DO NOT REMOVE THIS LINE
        javascriptEnabled: true,
        modifyVars: {
          hack: `true; @import 'ant-design-vue/es/style/themes/default.less'`, // dark.less
          '@primary-color': '#2C50EE', // 全局主色
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@ant-design/icons-vue', 'ant-design-vue'],
  },
  build: {
    rollupOptions: {
      treeshake: false,
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
});
