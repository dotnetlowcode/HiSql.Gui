import { changePassword } from '@/serverApi/request/oauth';

export class ChangePasswordViewModel {
  Password = ``;

  ConfirmPwd = ``;

  Save() {
    if (this.Password.length < 1) {
      throw `新密码不能为空!`;
    }
    if (this.Password.length < 1) {
      throw `新密码不能为空!`;
    }
    if (this.Password !== this.ConfirmPwd) {
      throw `两次密码不一致!`;
    }
    return changePassword(this.Password);
  }
}
