<template>
  <div class="w-full h-full flex flex-col">
    <div
      class="header h-50px w-full flex flex-row leading-50px px-17px box-border border-b-1px border-[#eeeeee]"
    >
      <div class="cursor-pointer backBtn" @click="goBack">
        <LeftOutlined />
        返回
      </div>
      <div class="flex-1 text-center text-size-[#191919] text-16px leading-50px">系统设置</div>
      <div class="w-100px"></div>
    </div>
    <div class="body flex-1 box-border overflow-hidden flex flex-row w-full">
      <div class="w-200px h-full overflow-y-auto border-r-1px border-[#eeeeee] text-center">
        <div
          v-for="item in menuList"
          :key="item.Code"
          class="h-40px leading-40px border-r-3px border-r-transparent cursor-pointer"
          :class="selectMenuInfo?.Code == item.Code ? 'active' : ''"
          @click="selectMenu(item)"
        >
          {{ item.Name }}
        </div>
      </div>
      <div class="flex-1 h-full border-r-1px border-[#eeeeee] bg-[#f5f5f5] flex flex-col">
        <div class="h-44px leading-44px pl-40px box-border text-size-[#191919] text-16px">
          {{ selectMenuInfo.Title }}
        </div>
        <div class="flex-1 bg-[#ffffff] m-16px mt-0 p-24px box-border">
          <permissionManagement v-if="selectMenuInfo.Code == '1'"></permissionManagement>
          <template v-if="selectMenuInfo.Code == '2'">
            <authority-waper
              :res-id="selectMenuInfo.TableName"
              :operate-id="`hiTable-tableData-query`"
            >
              <userList />
              <!-- <tableData
                :table-name="selectMenuInfo.TableName"
                :is-view-api="false"
                :is-set-page="true"
              /> -->
              <template #accessDenied>
                <noPermission />
              </template>
            </authority-waper>
          </template>
          <template v-if="selectMenuInfo.Code == '3'">
            <authority-waper
              :res-id="selectMenuInfo.TableName"
              :operate-id="`hiTable-tableData-query`"
            >
              <tableData
                :table-name="selectMenuInfo.TableName"
                :is-view-api="false"
                :is-set-page="true"
              />
              <template #accessDenied>
                <noPermission />
              </template>
            </authority-waper>
          </template>
          <template v-if="selectMenuInfo.Code == '4'">
            <changePassword />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LeftOutlined } from '@ant-design/icons-vue';
import changePassword from './userSetting/changePassword.vue';
import userList from './userSetting/userList.vue';

const emits = defineEmits([`closedPermissionManagement`]);

const menuList = ref<Array<any>>([
  {
    Name: '修改密码',
    Code: '4',
    Title: '修改密码',
    TableName: 'Hi_ChangePassword',
  },
  {
    Name: '权限管理',
    Code: '1',
    Title: '角色权限配置',
    TableName: '',
  },
  {
    Name: '用户管理',
    Code: '2',
    Title: '用户管理配置',
    TableName: 'Hi_UserInfo',
  },
  {
    Name: '用户组管理',
    Code: '3',
    Title: '用户组管理配置',
    TableName: 'Hi_Group',
  },
]);
const selectMenuInfo = ref();

// 默认第一个
// eslint-disable-next-line prefer-destructuring
selectMenuInfo.value = menuList.value[0];

const selectMenu = (item: any) => {
  selectMenuInfo.value = item;
};

const goBack = () => {
  emits('closedPermissionManagement');
};
</script>

<style lang="less" scoped>
.active {
  background-color: #eff0f9;
  color: #3245fa;
  border-right-color: #3245fa;
}
.backBtn {
  font-size: 14px;
  color: #262626;
  width: 83px;
  height: 32px;
  line-height: 32px;
  margin-top: 8px;
  background: #ffffff;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 16px;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.08);
}
</style>
