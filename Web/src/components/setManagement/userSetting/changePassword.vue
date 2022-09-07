<template>
  <div class="mainPage">
    <div class="fromBody">
      <div class="fromItem">
        <span class="fromItemTitle">密码</span>
        <div>
          <a-input v-model:value="viewModel.Password" type="password" autocomplete="off" />
        </div>
      </div>
      <div class="fromItem">
        <span class="fromItemTitle">确认密码</span>
        <div>
          <a-input v-model:value="viewModel.ConfirmPwd" type="password" autocomplete="off" />
        </div>
      </div>
      <div class="fromItem">
        <a-button type="primary" @click="savePwd">保存</a-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { message } from 'ant-design-vue';
import { ChangePasswordViewModel } from './changePasswordViewModel';

const viewModel = reactive(new ChangePasswordViewModel());
const savePwd = () => {
  viewModel
    .Save()
    .then(() => {
      message.success('已修改密码!');
      viewModel.Password = ``;
      viewModel.ConfirmPwd = ``;
    })
    .catch(err => {
      message.error(err);
    });
};
</script>
<style scoped lang="less">
.mainPage {
  position: relative;
  .fromBody {
    position: relative;
    padding-top: 50px;
  }
  .fromItem {
    display: flex;
    padding-left: 60px;
    margin-bottom: 10px;
  }
  .fromItemTitle {
    display: flex;
    align-items: center;
    width: 100px;
  }
}
</style>
