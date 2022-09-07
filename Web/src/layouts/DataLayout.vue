<template>
  <div class="dataLayout">
    <div
      class="pl-20px flex-shrink-0 pr-10px h-60px flex justify-between items-center overflow-hidden border-[1px]"
    >
      <hiSqlLogo />
      <dbVersion />
      <RightContent />
    </div>
    <div class="flex flex-grow main overflow-hidden">
      <div class="w-360px left overflow-hidden">
        <LeftMenu :prop-select-item="selectItem"></LeftMenu>
      </div>
      <div class="pull"></div>
      <div class="flex-grow right flex flex-col">
        <PageSign @update:param-list="updateSelectItem"></PageSign>
        <div class="flex-1 bg-[#ffffff] overflow-hidden">
          <!-- <PageSignContent></PageSignContent> -->
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router';
import RightContent from '@/components/RightContent/index.vue';
import LeftMenu from '@/components/leftMenu/leftMenu.vue';
import PageSign from '@/components/pageSign/pageSign.vue';
import { SelectItemType } from '@/components/leftMenu/leftMenuViewModel';
import PageSignContent from '@/components/pageSign/pageSignContent.vue';
import dbVersion from '@/components/database/dbVersion.vue';

const router = useRouter();
const selectItem = ref<SelectItemType>({});
const updateSelectItem = (data: any) => {
  debugger;
  selectItem.value = data;
};

// const { menuData } = getMenuData(clearMenuItem(router.getRoutes()));

// const apiMenuItem = {
//   tableName: ``,
//   title: `Api`,
//   key: `hiapi`,
//   type: 'ApiGroup',
//   iconName: 'icon-APIkaifa',
//   slots: {
//     icon: 'myIcon',
//   },
//   children: [] as Array<any>,
// };
// // 加载API分组
// getApiGroup().then(groups => {
//   for (let index = 0; index < groups.length; index++) {
//     const obj = groups[index];

//     apiMenuItem.children.push({
//       tableName: ``,
//       type: 'ApiGroup',
//       title: obj.GroupName,
//       key: obj.GroupName,
//     });
//   }
// });
// const menuTreeNode = reactive<Array<MenuTreeNode>>([apiMenuItem]);

// const proConfig = ref({
//   layout: 'mix',
//   fixedHeader: false,
//   fixSiderbar: false,
//   splitMenus: false,

//   menuHeaderRender: undefined,
//   footerRender: undefined,
//   headerRender: undefined,
// });
// const breadcrumb = computed(() =>
//   router.currentRoute.value.matched.concat().map(item => {
//     return {
//       path: item.path,
//       breadcrumbName: item.meta.title || '',
//     };
//   }),
// );

const dragControllerDiv = () => {
  const pull: any = document.getElementsByClassName('pull');
  const left: any = document.getElementsByClassName('left');
  // const right: any = document.getElementsByClassName('right');
  const main = document.getElementsByClassName('main');
  for (let i = 0; i < pull.length; i++) {
    pull[i].onmousedown = (e: any) => {
      pull[i].style.background = '#818181';
      const startX = e.clientX;
      pull[i].left = pull[i].offsetLeft;
      document.onmousemove = e => {
        const endX = e.clientX;
        let moveLen = pull[i].left + (endX - startX);
        const maxT = main[i].clientWidth - pull[i].offsetWidth;
        if (moveLen < 32) moveLen = 32;
        if (moveLen > maxT - 150) moveLen = maxT - 150;
        pull[i].style.left = moveLen;
        for (let j = 0; j < left.length; j++) {
          left[j].style.width = `${moveLen}px`;
          // right[j].style.width = `${main[i].clientWidth - moveLen - 10}px`;
        }
      };
      document.onmouseup = () => {
        pull[i].style.background = '#d6d6d6';
        document.onmousemove = null;
        document.onmouseup = null;
        pull[i].releaseCapture && pull[i].releaseCapture();
      };
      pull[i].setCapture && pull[i].setCapture();
      return false;
    };
  }
};
onMounted(() => {
  dragControllerDiv();
});
// function select(name: string, type: string, data: any) {
//   debugger;
//   // 路由跳转
//   if (type === 'table') {
//     router.push({
//       name: `tableDetail`,
//       params: {
//         tableName: name,
//       },
//     });
//   } else if (type === 'ApiDetailItem') {
//     router.push({
//       name: 'tableApiDetail',
//       params: {
//         id: data.key,
//       },
//     });
//   } else if (type === 'view') {
//     router.push({
//       name: 'tableViewDetail',
//       params: {
//         viewName: data.value,
//       },
//     });
//   }
// }
</script>

<style scoped>
.dataLayout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
::v-deep(.ant-tree-treenode-switcher-close) {
  overflow: hidden;
}
.main {
  background: #fafafa;
}
.pull {
  cursor: col-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  width: 5px;
  background-size: cover;
  background-position: center;
  font-size: 32px;
}
.right {
  max-width: calc(100% - 365px);
  display: flex;
  flex-direction: column;
}

::v-deep(.ant-page-header-ghost) {
  background: #ffffff;
  padding-top: 0 !important;
  height: 100%;
}
::v-deep(.ant-page-header-content) {
  padding-top: 0 !important;
}
</style>
