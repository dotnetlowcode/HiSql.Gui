import { message } from 'ant-design-vue';

import { SyncEach } from '@/helper/arrayHelper';
import {
  HiAuthorityAPIs,
  RoleSimpleAuth,
} from '@/serverApi/hiAuthorityAPIs';

export class RoleInfo {
  RId = '';

  Name = '';
}

/**
 * 已配置返回数据
 */
export class ConfiguredInfo {
  RefValueText = '';

  RefValues = '';

  ResId = '';
}

/**
 * 模块类型返回数据
 */
export class ModuleType {
  MId = '';

  Name = '';

  ParentId?: string;

  RefField?: string;

  RefTab?: string;

  RefTextField?: string;

  RefWhere?: string;
}

export class PermissionManagementModel {
  /**
   * 加载角色菜单顶级模块
   */
  async getRoleAuthTabs() {
    // eslint-disable-next-line no-return-await
    return await HiAuthorityAPIs.getRoleAuthTabs();
  }

  /**
   * 加载已配置权限
   * @param roleId
   * @param moduleId
   */
  async loadRoleResList(roleId: string, moduleId: string) {
    // eslint-disable-next-line no-return-await
    return await HiAuthorityAPIs.loadRoleResList(roleId, moduleId);
  }

  /**
   *  删除角色下的资源权限
   * @param roleId
   * @param respId
   */
  async delteRespAuth(roleId: string, respId: string) {
    // eslint-disable-next-line no-return-await
    return await HiAuthorityAPIs.delteRespAuth(roleId, respId);
  }

  /**
   * 加载资源权限列表
   * @param roleId
   * @param moduleId
   */
  async loadResAuthList(moduleId: string) {
    // eslint-disable-next-line no-return-await
    // eslint-disable-next-line no-return-await
    return await HiAuthorityAPIs.loadResAuthList(moduleId);
  }

  /**
   * 保存角色权限
   * @param roleId
   * @param moduleId
   */
  async saveRoleAuth(
    roleId: string,
    moduleId: string,
    respId: string,
    authList: Array<RoleSimpleAuth>,
  ) {
    // eslint-disable-next-line no-return-await
    return await HiAuthorityAPIs.saveRoleAuth(roleId, moduleId, respId, authList);
  }

  /**
   * 获取角色列表
   */
  async getRoles() {
    // eslint-disable-next-line no-return-await
    return await HiAuthorityAPIs.getRoles();
  }

  // 保存权限配置
  async submitRoleAuth(params: any) {
    const roleId = params.RId;
    const moduleId = params.MId;
    const { tableNameList } = params;
    const { selectedPermission } = params;
    const authList: RoleSimpleAuth[] = [];
    let obj = new RoleSimpleAuth();
    if (!roleId) {
      message.warning(`请选择角色!`);
      return;
    }
    if (!moduleId) {
      message.warning(`请选择模块!`);
      return;
    }
    if (!tableNameList) {
      message.warning(`请添加表！`);
      return;
    }

    let resText = '';
    let refValues = '';
    for (const key in selectedPermission) {
      if (Object.prototype.hasOwnProperty.call(selectedPermission, key)) {
        const element = selectedPermission[key];
        if (element && element.value) {
          resText += `,${element.text}`;
          refValues += `,${element.value}`;
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    resText = resText.substring(1, resText.length);
    refValues = refValues.substring(1, refValues.length);
    // eslint-disable-next-line prefer-destructuring
    obj.RefValueText = resText;
    // eslint-disable-next-line prefer-destructuring
    obj.RefValues = refValues;

    // 新增多个表名，批量添加权限
    tableNameList.forEach((ele: string) => {
      obj = JSON.parse(JSON.stringify(obj));
      obj.ResId = ele;
      authList.push(obj);
    });
    const respId = tableNameList.toString();
    await SyncEach(tableNameList, async (respId: string) => {
      const res = await this.saveRoleAuth(roleId, moduleId, respId, authList);
      return true;
    });

    return true;
  }
}
