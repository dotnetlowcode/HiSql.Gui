<template>
  <div class="w-full h-full relative">
    <div class="w-38/100 h-55vh mx-auto box-border absolute left-31/100 top-20vh">
      <div class="login-logo">
        <hiSqlLogo />
      </div>
      <div class="w-full border border-[#DADCE0] px-16 box-border pb-10 rounded-lg">
        <div class="text-center text-size-[#262626] text-[1.625rem] font-bold mt-12">欢迎登录</div>
        <div class="text-center text-size-[#BBBBBB] text-[0.875rem] mt-3 mb-14">
          请输入您的帐号和密码进行登录
        </div>
        <a-form ref="formRef" :rules="rules" :model="formState">
          <a-form-item name="username">
            <!-- <div class="login-left-input-label">用户名</div> -->
            <a-input v-model:value="formState.username" size="large" placeholder="用户名">
              <template #prefix>
                <!-- <user-outlined type="user" /> -->
                <img class="w-5 h-4" src="@/assets/user.svg" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <!-- <div class="login-left-input-label">密码</div> -->
            <a-input
              v-model:value="formState.password"
              size="large"
              placeholder="密码"
              type="password"
            >
              <template #prefix>
                <!-- <user-outlined type="user" /> -->
                <img class="w-5 h-4" src="@/assets/psd.svg" />
              </template>
            </a-input>
          </a-form-item>
          <!-- <a-tabs size="large" :tab-bar-style="{ textAlign: 'center' }" style="padding: 0 2px">
            <a-tab-pane key="1" tab="账户密码登录">
              <a-form-item name="username">
                <a-input
                  v-model:value="formState.username"
                  size="large"
                  placeholder="请输入用户名..."
                >
                  <template #prefix>
                    <user-outlined type="user" />
                  </template>
                </a-input>
              </a-form-item>
              <a-form-item name="password">
                <a-input
                  v-model:value="formState.password"
                  size="large"
                  placeholder="请输入密码..."
                  type="password"
                ></a-input>
              </a-form-item>
            </a-tab-pane>
          </a-tabs> -->
          <div>
            <a-checkbox v-model:checked="formState.remember">
              <span class="text-[0.875rem] text-size-[#888888]">自动登录</span>
            </a-checkbox>
          </div>
          <a-form-item>
            <a-button
              :loading="logging"
              style="
                width: 100%;
                margin-top: 64px;
                background: #455ae6;
                color: #ffffff;
                font-size: 16px;
                border: none;
                outline: none;
                box-shadow: none;
                border-radius: 8px;
              "
              size="large"
              type="primary"
              @click="onSubmit"
            >
              登录
            </a-button>
          </a-form-item>
          <!-- <div>
          其他登录方式
          <a-icon class="icon" type="alipay-circle" />
          <a-icon class="icon" type="taobao-circle" />
          <a-icon class="icon" type="weibo-circle" />
          <router-link style="float: right" to="/dashboard/workplace">注册账户</router-link>
        </div> -->
        </a-form>
      </div>
    </div>
    <!-- <div class="login-right"><img class="w-full h-full" src="@/assets/login-img.png" /></div> -->
  </div>
</template>
<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue';
import { FormInstance, message } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { useRouter } from 'vue-router';
import { userLogin } from '@/serverApi/request/oauth';
import serverApiClient from '@/serverApi/httpClient';
import { store } from '@/store';

interface FormState {
  username: string;
  password: string;
  remember: boolean;
}
const formState = reactive<FormState>({
  username: '',
  password: '',
  remember: true,
});
const rules: Record<string, Rule[]> = {
  username: [
    {
      required: true,
      message: `请输入用户名!`,
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: `请输入登录密码!`,
      trigger: 'blur',
    },
  ],
};
const logging = ref(false);
const formRef = ref<FormInstance>();
const route = useRouter();
const onSubmit = () => {
  formRef.value
    ?.validate()
    .then(async () => {
      const loginResult = await userLogin(formState.username, formState.password);
      if (loginResult.StatusCode === 500 || !loginResult.Data?.AccessToken) {
        message.error(loginResult.ErrorMessage);
        return;
      }
      serverApiClient.SetTokenResult(loginResult.Data?.AccessToken);
      // 清空缓存页签
      store.commit('clearTabs');
      store.commit('setCurrentTab', {});
      store.commit('setCurrentMenuType', '');
      localStorage.removeItem('tableSimpleNameListKey'); // 清除左侧表名描述缓存
      route.push({ name: `tableDetail`, params: { tableName: `Hi_TabModel` } });
    })
    .catch((error: any) => {
      console.log('error', error);
    });
};
</script>

<style lang="less" scoped>
.common-layout {
  .login {
    .login-left-title {
      font-size: 28px;
      font-weight: 700;
      text-align: left;
      color: #262626;
      letter-spacing: 1.68px;
      margin-bottom: 40px;
    }
    .login-left-input-label {
      font-size: 14px;
      text-align: left;
      color: #262626;
      letter-spacing: 0.84px;
      margin-bottom: 9px;
    }

    .icon {
      font-size: 24px;
      color: #777;
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        // color: @primary-color;
      }
    }
  }
}
.login-logo {
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}
</style>
