import dayjs from 'dayjs';
import { List } from 'linqts';
import { createStore } from 'vuex';

// eslint-disable-next-line prettier/prettier
import {
  ExportTaskStatusCheckRequest,
} from '@/serverApi/request/tableData/createExportTaskRequest';
import { exportTaskStatusCheck } from '@/serverApi/tableDataAPIs';
import bus from '@/utils';

// eslint-disable-next-line prettier/prettier
import {
  ExportTaskAddEvent,
  ExportTaskInfoModel,
} from './model/exportTaskInfo';

const localStorageKey = 'HiSql_GState';
// 创建一个新的 store 实例
export type StoreType = {
  ExportTask: Array<ExportTaskInfoModel>;
};
export const store = createStore<StoreType>({
  state() {
    const stateData = {
      ExportTask: [] as Array<ExportTaskInfoModel>,
    };
    const localObj = sessionStorage.getItem(localStorageKey);
    if (localObj) {
      Object.assign(stateData, JSON.parse(localObj));
      new List(stateData.ExportTask).OrderByDescending(r => {
        let t: Date;
        if (typeof r.UpdateTime === 'string') {
          t = dayjs(r.UpdateTime).toDate();
        } else {
          t = r.UpdateTime;
        }
        return t.getTime();
      });
    }
    return stateData;
  },
  actions: {
    addExportTask: (ctx, playload: ExportTaskInfoModel) => {
      ctx.state.ExportTask.unshift(playload);
      ctx.dispatch(`saveState`);
      // eslint-disable-next-line no-use-before-define
      serverTaskWach.syncServerTaskStatus();
      bus.emit(ExportTaskAddEvent);
    },
    clearOverTask: ctx => {
      const removeItems = ctx.state.ExportTask.filter(r => r.Status === 200 || r.Status === 500);
      removeItems.forEach(r => {
        const i = ctx.state.ExportTask.indexOf(r);
        ctx.state.ExportTask.splice(i, 1);
      });
      ctx.dispatch('saveState');
    },
    saveState: ctx => {
      sessionStorage.setItem(localStorageKey, JSON.stringify(ctx.state));
    },
    // KK(k) {},
  },
  mutations: {
    // increment(state) {},
  },
  modules: {
    // pageSignStore,
  },
});
class ServerTaskWatch {
  constructor() {
    this.syncServerTaskStatus();
  }

  isRun = false;

  /**
   * 将服务端的状态同步到客户端
   */
  async syncServerTaskStatus() {
    const tempList = new List(store.state.ExportTask);
    const req = new ExportTaskStatusCheckRequest();
    req.TaskIds = tempList
      .Where(r => (r?.Status ?? 0) < 20) // 过滤掉不需要同步到任务状态
      .Select(r => r.TaskId)
      .ToArray();
    const tNumber = tempList.Max(r => {
      let t: Date;
      if (typeof r.UpdateTime === 'string') {
        t = dayjs(r.UpdateTime).toDate();
      } else {
        t = r.UpdateTime;
      }
      return t.getTime();
    });
    req.LastUpdateTime = new Date(tNumber);
    if (req.TaskIds.length < 1) {
      this.isRun = false;
      return false;
    }
    this.isRun = true;
    const resp = await exportTaskStatusCheck(req);
    const taskList = resp.Data?.List ?? [];
    if (taskList.length > 0) {
      taskList.forEach(r => {
        const current = tempList.FirstOrDefault(k => k?.TaskId === r.TaskId);
        try {
          if (r.Result) {
            const resultObj: {
              Message: string;
              InnerMessage: string;
              TotalTime: number;
              FilePath: string;
            } = JSON.parse(r.Result);
            current.Message = resultObj.Message;
          }
          current.Result = r.Result;
          current.Status = r.Status;
          current.UpdateTime = new Date(r.UpdateTime);
        } catch (error) {
          console.error(error);
        }
      });
      store.dispatch(`saveState`);
    }
    setTimeout(() => {
      this.syncServerTaskStatus();
    }, 1000);
    return true;
  }
}

export const serverTaskWach = new ServerTaskWatch();
