import { StringHelper } from '@/helper/stringHelper';
import ApiResultModel from '@/serverApi/apiModels/apiResultModel';
import serverApiClient from '@/serverApi/httpClient';
import { tableDataAdd, tableDataQuery, tableDataUpdate } from '@/serverApi/tableDataAPIs';
import { HiTaskEntity } from './HiTaskEntity';
import { TableTaskDeleteRequest, TableTaskDeleteResponse } from './tableTaskDeleteRequest';
import { TableTaskStateSyncRequest, TableTaskStateSyncResponse } from './tableTaskStateSyncRequest';

const tableTaskTableName = `Hi_Task`;
/**
 * 任务状态同步
 * @param taskIds
 * @returns
 */
export const tableTaskStateSync = async (taskIds: Array<string>) => {
  if (taskIds.length < 1) {
    throw `TaskIds数量必须大于0`;
  }
  const url = `hidata/tableTask/stateSync`;
  const req = new TableTaskStateSyncRequest();
  req.TaskIds = taskIds;
  return serverApiClient.Post<ApiResultModel<TableTaskStateSyncResponse>>(url, req, {
    IsAuth: false,
  });
};

/**
 * 保存或更新任务
 * @param taskInfo
 * @returns
 */
export const saveTableTask = async (taskInfo: HiTaskEntity) => {
  if (taskInfo.TaskId) {
    taskInfo.UpdateTime = new Date();
    const updateReulst = await tableDataUpdate(tableTaskTableName, taskInfo, {
      TaskId: taskInfo.TaskId,
    });

    const isOK = (updateReulst.Data?.ModifyCount ?? 0) > 0;
    if (isOK) {
      await tableTaskStateSync([taskInfo.TaskId]);
    }
    return isOK;
  }
  taskInfo.TaskId = (await StringHelper.genSnowflakeid()).toString();
  const addResult = await tableDataAdd(tableTaskTableName, [taskInfo]);
  const addSuccess = (addResult.Data?.AddCount ?? 0) > 0;
  if (addSuccess) {
    await tableTaskStateSync([taskInfo.TaskId]);
  }
  return addResult;
};

/**
 * 获取任务信息
 * @param taskId
 * @returns
 */
export const getTableTask = async (taskId: string) => {
  const queryResult = await tableDataQuery(tableTaskTableName, {
    where: {
      TaskId: taskId,
    },
    orderByField: 'TaskId',
  });
  const queryArray = queryResult.Data?.List ?? [];
  if (queryArray.length > 0) {
    return queryArray[0] as HiTaskEntity;
  }
  return undefined;
};

/**
 * 获取所有任务列表
 * @returns
 */
export const getTableTaskList = async () => {
  const queryResult = await tableDataQuery(tableTaskTableName, {
    where: {},
    orderByField: 'TaskId',
  });
  return (queryResult.Data?.List ?? []) as Array<HiTaskEntity>;
};

/**
 * 删除任务
 * @param taskIds
 * @returns
 */
export const tableTaskDelete = async (taskIds: Array<string>) => {
  if (taskIds.length < 1) {
    throw `TaskIds数量必须大于0`;
  }
  const url = `hidata/tableTask/delete`;
  const req = new TableTaskDeleteRequest();
  req.TaskIds = taskIds;
  return serverApiClient.Post<ApiResultModel<TableTaskDeleteResponse>>(url, req, {
    IsAuth: false,
  });
};
