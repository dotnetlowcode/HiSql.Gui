import { message } from 'ant-design-vue';
import { ColumnStruct } from '@/serverApi/models/columnStruct';
import { getTableInfo } from '@/serverApi/tableInfoAPIs';
import { addUserInfo } from '@/serverApi/request/oauth';
import { FromEditVueType } from '@/components/columsTypes/fromEdit/fromEditViewModel';

export class UserListViewModel {
  showAddFrom = false;

  fileds: ColumnStruct[] = [];

  fieldObj = {
    UserName: ``,
    GId: `guestGroup`,
    RId: `normalUser`,
    Password: ``,
  };

  async Load() {
    const userInfo = await getTableInfo(`Hi_UserInfo`);
    if (userInfo.Data?.TabColumns) {
      const exclude = ['UserName', 'GId', 'RId', `Password`];
      for (let index = 0; index < userInfo.Data?.TabColumns.length; index++) {
        const element = userInfo.Data?.TabColumns[index];
        if (exclude.includes(element.FieldName)) {
          this.fileds.push(element);
        }
      }
    }
  }

  FromEditObj?: FromEditVueType;

  async SaveUser() {
    const obj = await this.FromEditObj?.Save();

    if (obj.UserName.length < 1) {
      message.warn(`请输入用户名!`);
      return;
    }
    addUserInfo(obj)
      .then(addResult => {
        window.location.reload();
      })
      .catch(err => {
        message.warn(err);
      });
  }
}
