import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import BlankLayout from '../layouts/BlankLayout.vue';
import DataLayout from '../layouts/DataLayout.vue';

const hasGithubPages = true; //= import.meta.env.VITE_GHPAGES;

/**
 * 新增表格RouterName
 */
export const addTableRouterName = `TableAdd`;

/**
 * 新增视图RouterName
 */
export const addViewTableRouterName = `TableViewAdd`; // `ViewTableAdd`;

/**
 * 新增逻辑块API,RouterName
 */
export const addBlockApiRouterName = `BlockApiAdd`;

/**
 * 新增表任务RouterName
 */
export const addTableTaskRouterName = `AddTableTask`;

/**
 * 新增Excel导出模板RouterName
 */
export const addExcelExportTemplateRouterName = `AddExcelExportTemplate`;

/**
 * 表详情RouterName
 */
export const tableDetailRouterName = `tableDetail`;

/**
 * 看板分享页面
 */
export const dashboardSharedRouterName = `dashboardShared`;

/**
 * 登录页面
 */
export const loginRouterName = 'login';

export const getDaahboardUrl = (id = ':id') => {
  return `/dashboard/shared/${id}`;
};
// hasGithubPages ? createWebHashHistory() : createWebHistory(),
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/test',
      name: 'test',
      meta: { title: 'test' },
      component: () => import('../views/admins/page1.vue'),
    },
    {
      path: getDaahboardUrl(),
      name: dashboardSharedRouterName,
      meta: { title: '看板分享' },
      component: () => import('../views/hisql/shared/dashboardShared.vue'),
    },
    {
      path: '/',
      name: 'loginIndex',
      meta: {
        title: 'Home',
      },
      component: BlankLayout,
      redirect: () => ({
        name: 'login',
      }),
      children: [
        {
          path: '/login',
          name: loginRouterName,
          meta: { title: '欢迎', icon: 'icon-icon-test' },
          component: () => import('../views/hisql/login.vue'),
        },
      ],
    },
    {
      path: '/table',
      name: 'index',
      meta: { title: 'Home' },
      component: DataLayout,
      redirect: () => ({
        name: addTableRouterName,
      }),
      children: [
        {
          path: '/table',
          name: 'table',
          meta: {
            title: '表管理',
          },
          component: BlankLayout,
          redirect: () => ({
            name: addTableRouterName,
          }),
          children: [
            {
              path: '/table/add',
              name: addTableRouterName,
              meta: { title: '添加表' },
              component: () => import('../views/hisql/tableDetail/tableAdd.vue'),
            },
            {
              path: '/table/:tableName',
              name: tableDetailRouterName,
              meta: { title: '表编辑' },
              component: () => import('../views/hisql/tableDetail/tableDetail.vue'),
            },
          ],
        },
        {
          path: '/tableView',
          name: 'tableView',
          meta: {
            title: '视图',
          },
          component: BlankLayout,
          redirect: () => ({
            name: addViewTableRouterName,
          }),
          children: [
            {
              path: '/tableView/add',
              name: addViewTableRouterName,
              meta: { title: '添加视图' },
              component: () =>
                import('../views/hisql/tableViewDetail/tableViewAdd/tableViewAdd.vue'),
            },
            {
              path: '/tableView/:viewName',
              name: 'tableViewDetail',
              meta: { title: '视图编辑' },
              component: () => import('../views/hisql/tableViewDetail/tableViewDetail.vue'),
            },
          ],
        },
        {
          path: '/tableApi',
          name: 'tableQueryApi',
          meta: {
            title: 'Api管理',
          },
          component: BlankLayout,
          redirect: () => ({ name: 'tableAddApi' }),
          children: [
            {
              path: '/tableApi/add',
              name: addBlockApiRouterName,
              meta: { title: 'Api新增' },
              component: () => import('../views/hisql/apiDetail/apiDetail.vue'),
            },
            {
              path: '/tableApi/:id',
              name: 'tableApiDetail',
              meta: { title: 'Api编辑' },
              component: () => import('../views/hisql/apiDetail/apiDetail.vue'),
            },
          ],
        },
        {
          path: '/tableTask',
          name: 'tableTask',
          meta: {
            title: '数据任务',
          },
          component: BlankLayout,
          redirect: () => ({
            name: addTableTaskRouterName,
          }),
          children: [
            {
              path: '/tableTask/add',
              name: addTableTaskRouterName,
              meta: { title: '新增数据任务' },
              component: () => import('../views/hisql/tableTask/tableTask.vue'),
            },
            {
              path: '/tableTask/:taskId',
              name: 'tableTaskDetail',
              meta: { title: '数据任务详情' },
              component: () => import('../views/hisql/tableTask/tableTask.vue'),
            },
          ],
        },
        {
          path: '/exportExcel',
          name: 'ExportExcel',
          meta: {
            title: 'Excel导出模板设定',
          },
          component: BlankLayout,
          redirect: () => ({
            name: addExcelExportTemplateRouterName,
          }),
          children: [
            {
              path: '/exportExcel/add',
              name: addExcelExportTemplateRouterName,
              meta: { title: '添加Excel导出模板设定' },
              component: () => import('../views/hisql/exportExcel/exportExcel.vue'),
            },
            {
              path: '/exportExcel/:Id',
              name: 'editExportExcel',
              meta: { title: '编辑Excel导出模板设定' },
              component: () => import('../views/hisql/exportExcel/exportExcel.vue'),
            },
          ],
        },
        {
          // eslint-disable-next-line spaced-comment
          path: '/emptypage', //跳转空白页面
          name: 'emptypage',
          meta: { title: 'emptypage' },
          component: () => import('../views/admins/emptypage.vue'),
        },
      ],
    },
  ],
});
