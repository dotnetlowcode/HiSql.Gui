import { Dictionary } from '@/helper/arrayHelper';
import dayjs from 'dayjs';
import { reactive } from 'vue';
import { HiAuthorityAPIs } from '@/serverApi/hiAuthorityAPIs';

export const userAuthList = reactive<Dictionary<string, Array<string>>>({});

export const userRole = reactive<Dictionary<string, string>>({});

/**
 * 超级管理员
 */
export const superAdmin = 'superAdmin';

/**
 * 清空用户权限
 */
export const clearUserAuth = async () => {
  Object.keys(userAuthList).forEach(key => {
    delete userAuthList[key];
  });
};

let lastRefFlag: Date | undefined;

/**
 * 刷新用户权限
 */
export const refreshUserAuth = async () => {
  const resp = await HiAuthorityAPIs.getUserAuth();
  clearUserAuth();
  resp.resAuth.forEach(r => {
    userAuthList[r.ResId] = r.RefValues.split(`,`);
  });
  resp.userRole.forEach(r => {
    userRole[r.RId] = r.Name;
  });
  lastRefFlag = new Date();
};

export class AuthorityViewModel {
  hasAuth = false;

  async Init(resId: string, operateId: string) {
    /**
     * 如果还没有权限或者超过60分钟,就刷新权限数据
     */
    if (!lastRefFlag || dayjs(lastRefFlag).diff(new Date(), `minute`) > 60) {
      const t = dayjs(lastRefFlag).diff(new Date(), `minute`);
      console.log(t);
      await refreshUserAuth();
    }
    if (userRole[superAdmin]) {
      // 如果是超级管理员角,就有所有权限
      this.hasAuth = true;
      return;
    }
    if (!userAuthList[resId]) {
      this.hasAuth = false;
      return;
    }
    if (operateId && userAuthList[resId].indexOf(operateId) > -1) {
      this.hasAuth = true;
      return;
    }
    this.hasAuth = false;
  }
}
