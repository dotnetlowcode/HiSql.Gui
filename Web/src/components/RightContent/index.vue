<template>
  <div>
    <a-dropdown>
      <template #overlay>
        <a-menu>
          <a-menu-item>
            <template #icon>
              <SettingOutlined />
            </template>
            <span @click="openSetting">个人设置</span>
          </a-menu-item>
          <a-menu-item>
            <template #icon>
              <LogoutOutlined />
            </template>
            <span @click="loginOut">退出登录</span>
          </a-menu-item>
        </a-menu>
      </template>
      <a-avatar size="small">
        <template #icon>
          <UserOutlined />
        </template>
      </a-avatar>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import serverApiClient from '@/serverApi/httpClient';
import { loginRouterName } from '@/router';
// eslint-disable-next-line no-undef
const router = useRouter(); // 页面跳转路由;

const loginOut = () => {
  serverApiClient.clearLoginInfo();
  router.push({
    name: loginRouterName,
  });
};
const openSetting = () => {};
</script>
