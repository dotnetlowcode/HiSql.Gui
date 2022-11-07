// 加载顶级菜单
// 1. select * from Hi_Module where ParentId=''
// 加载当前菜单下已经配置的资源
// 2. select * from Hi_RoleModuleMap where RId='xxx' and MId='选中的模块'
// 加载某个资源的权限详情
// 3. select * from Hi_RoleModuleMap where RId='xxx' and MId='选中的模块' and ResId='选中的资源Id'
// 加载权限树
// 4. select * from Hi_Module where ParentId='XXXX'
// 5. select * from Hi_ModuleTypeOperate where MId in (`4步骤中获取的模块Id集合`)
// 保存选择结果
import { HiApiExcuteApi } from './hiApiAPIs';
import {
  TableDataTransactionOperateRequest,
  TableOperate,
  TranOperteItem,
} from './request/tableData/tableDataTransactionOperate';
import { tableDataQuery, tableDataTranOperate } from './tableDataAPIs';

export const HiModuleTableName = `Hi_Module`;
export const HiRoleModuleMapTableName = `Hi_RoleModuleMap`;
export const HiRoleTableName = `Hi_Role`;

export class RoleSimpleAuth {
  ResId = ``;

  RefValueText = ``;

  RefValues = ``;
}

/**
 * 角色权限相关API
 */
export class HiAuthorityAPIs {
  /**
   * 加载角色菜单顶级模块
   * @returns
   */
  static async getRoleAuthTabs() {
    const result = await tableDataQuery<{
      MId: string;
      ParentId: string;
      Name: string;
      RefTab: string;
      RefTextField: string;
      RefField: string;
      RefWhere: string;
    }>(HiModuleTableName, {
      where: {
        ParentId: ``,
      },
      orderByField: 'MId',
      fields: 'MId,ParentId,Name,RefTab,RefTextField,RefField,RefWhere',
    });
    return result.Data?.List ?? [];
  }

  /**
   * 加载已配置权限
   * @param roleId
   * @param moduleId
   * @returns
   */
  static async loadRoleResList(roleId: string, moduleId: string) {
    const result = await tableDataQuery<RoleSimpleAuth>(HiRoleModuleMapTableName, {
      where: {
        RId: roleId,
        MId: moduleId,
      },
      orderByField: 'ResId',
      fields: 'ResId,RefValueText,RefValues',
    });
    return result.Data?.List ?? [];
  }

  /**
   * 加载资源权限列表
   * @param moduleId
   * @returns
   */
  static async loadResAuthList(moduleId: string) {
    const result = await tableDataQuery<{
      MId: string;
      ParentId: string;
      Name: string;
      RefTab: string;
      RefTextField: string;
      RefField: string;
      RefWhere: string;
    }>(HiModuleTableName, {
      where: {
        ParentId: moduleId,
      },
      orderByField: 'MId',
      fields: 'MId,ParentId,Name,RefTab,RefTextField,RefField,RefWhere',
    });
    return result.Data?.List ?? [];
  }

  /**
   * 保存角色权限
   */
  static async saveRoleAuth(
    roleId: string,
    moduleId: string,
    respId: string,
    authList: Array<RoleSimpleAuth>,
  ) {
    const req = new TableDataTransactionOperateRequest();
    req.Operates.push(
      new TranOperteItem(HiRoleModuleMapTableName, TableOperate.Delete, {
        WhereJson: {
          RId: roleId,
          MId: moduleId,
          ResId: respId,
        },
      }),
    );
    const addList = authList.map(authObj =>
      Object.assign(authObj, {
        RId: roleId,
        MId: moduleId,
      }),
    );
    req.Operates.push(
      new TranOperteItem(HiRoleModuleMapTableName, TableOperate.Add, {
        AddDatas: addList,
      }),
    );
    const result = await tableDataTranOperate(req);
    return (result.Data?.AddCount ?? 0) > 0;
  }

  /**
   * 删除角色下的资源权限
   * @param roleId
   * @param respId
   * @returns
   */
  static async delteRespAuth(roleId: string, respId: string) {
    const req = new TableDataTransactionOperateRequest();
    req.Operates.push(
      new TranOperteItem(HiRoleModuleMapTableName, TableOperate.Delete, {
        WhereJson: {
          RId: roleId,
          ResId: respId,
        },
      }),
    );
    const result = await tableDataTranOperate(req);
    return (result.Data?.DeleteCount ?? 0) > 0;
  }

  /**
   * 获取当前登录用户的权限
   * @returns
   */
  static async getUserAuth() {
    const userAuthApiId = `7d777c8e-c615-47cb-a310-790c2507ea40`;
    const result = await HiApiExcuteApi(userAuthApiId, {});
    const resAuth = result.Default.Table as Array<{
      ResId: string;
      RefValues: string;
    }>;
    const userRole = result.UserRole.Table as Array<{
      Name: string;
      RId: string;
    }>;
    return {
      resAuth,
      userRole,
    };
  }

  /**
   * 获取角色列表
   * @returns
   */
  static async getRoles() {
    const result = await tableDataQuery<{
      RId: string;
      Name: string;
    }>(HiRoleTableName, {
      where: {},
      orderByField: 'RId',
      fields: 'RId,Name',
    });
    return result.Data?.List ?? [];
  }
}
